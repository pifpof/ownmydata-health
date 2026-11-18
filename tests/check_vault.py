#!/usr/bin/env python3
"""Test helper for ownmydata vaults. NOT used by any skill (skills are scriptless in v0.1).

Usage: .venv/bin/python tests/check_vault.py <vault-root>

Checks (spec section 17 numbering):
  V1  every non-reserved .md under memory/ (plus memory.md) has parseable frontmatter and a non-empty `type`
  --  no top-level `status` anywhere; index.md / log.md carry no frontmatter (memory/index.md may declare okf_version)
  V2  `type` matches fhir.resourceType (kebab-case) and the folder
  V3  fhir.id equals the filename stem and obeys the id grammar
  V5  status values come from the R4 value sets
  V6  Condition abatement implies clinicalStatus inactive/resolved/remission
  V7  every Type/id reference, vault.episode, vault.documents entry and relative body link resolves
  V9  lab-v1 tables have 7 columns, codes look like loinc:NNNN-N, flags from the allowed set; fhir dates are ISO 8601
Exit code 1 if any error.
"""
import os
import re
import sys

import yaml

ERRORS, WARNS = [], []

TYPE_MAP = {
    # okf type: (resourceType or None, folder regex relative to memory/)
    "patient": ("Patient", r"^patient$"),
    "practitioner": ("Practitioner", r"^patient/care-team$"),
    "organization": ("Organization", r"^patient/care-team$"),
    "device": ("Device", r"^patient/devices$"),
    "condition": ("Condition", r"^conditions$"),
    "encounter": ("Encounter", r"^encounters/\d{4}$"),
    "diagnostic-report": ("DiagnosticReport", r"^reports/\d{4}$"),
    "observation": ("Observation", r"^observations/standalone/\d{4}$"),
    "procedure": ("Procedure", r"^procedures$"),
    "medication-statement": ("MedicationStatement", r"^medications$"),
    "allergy-intolerance": ("AllergyIntolerance", r"^allergies$"),
    "immunization": ("Immunization", r"^immunizations$"),
    "care-plan": ("CarePlan", r"^plans$"),
    "goal": ("Goal", r"^plans$"),
    "document-reference": ("DocumentReference", r"^documents/\d{4}$"),
    "family-member-history": ("FamilyMemberHistory", r"^family-history$"),
    "episode": (None, r"^episodes$"),
    "reference": (None, r"^reference$"),
    "decision": (None, r"^decisions$"),
    "library": (None, r"^library$"),
    "system": (None, r"^$"),
}
PREFIX = {
    "Patient": ("pt", False), "Practitioner": ("prac", False), "Organization": ("org", False),
    "Device": ("dev", False), "Condition": ("cond", True), "Encounter": ("enc", True),
    "DiagnosticReport": ("rpt", True), "Observation": ("obs", True), "Procedure": ("proc", True),
    "MedicationStatement": ("med", True), "AllergyIntolerance": ("alg", False),
    "Immunization": ("imm", True), "CarePlan": ("plan", True), "Goal": ("goal", True),
    "DocumentReference": ("doc", True), "FamilyMemberHistory": ("fmh", False),
}
STATUS_SETS = {
    "Encounter": {"planned", "arrived", "triaged", "in-progress", "onleave", "finished", "cancelled", "entered-in-error", "unknown"},
    "DiagnosticReport": {"registered", "partial", "preliminary", "final", "amended", "corrected", "appended", "cancelled", "entered-in-error", "unknown"},
    "Observation": {"registered", "preliminary", "final", "amended", "corrected", "cancelled", "entered-in-error", "unknown"},
    "Procedure": {"preparation", "in-progress", "not-done", "on-hold", "stopped", "completed", "entered-in-error", "unknown"},
    "MedicationStatement": {"active", "completed", "entered-in-error", "intended", "stopped", "on-hold", "unknown", "not-taken"},
    "Immunization": {"completed", "entered-in-error", "not-done"},
    "DocumentReference": {"current", "superseded", "entered-in-error"},
    "FamilyMemberHistory": {"partial", "completed", "entered-in-error", "health-unknown"},
    "Device": {"active", "inactive", "entered-in-error", "unknown"},
}
CLINICAL = {"active", "recurrence", "relapse", "inactive", "remission", "resolved"}
VERIF = {"unconfirmed", "provisional", "differential", "confirmed", "refuted", "entered-in-error"}
EPISODE_STATES = {"planned", "waitlist", "active", "onhold", "finished", "cancelled", "entered-in-error"}
FLAGS = {"", "H", "L", "N", "HH", "LL", "A"}
ISO = re.compile(r"^\d{4}(-\d{2}(-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2}))?)?)?$")
DATE_KEYS = {"effectiveDateTime", "issued", "onsetDateTime", "recordedDate", "abatementDateTime",
             "occurrenceDateTime", "performedDateTime", "date", "start", "end", "birthDate", "dateAsserted"}


def err(path, msg):
    ERRORS.append(f"ERROR {path}: {msg}")


def warn(path, msg):
    WARNS.append(f"warn  {path}: {msg}")


def split_frontmatter(text):
    if not text.startswith("---\n"):
        return None, text
    end = text.find("\n---", 4)
    if end == -1:
        return None, text
    return text[4:end], text[end + 4:]


def ref_to_path(ref):
    """Type/id -> path under memory/ (spec 5.2)."""
    m = re.match(r"^([A-Za-z]+)/([a-z0-9-]+)$", ref)
    if not m:
        return None
    t, i = m.groups()
    year = (re.search(r"-(\d{4})\d{4}-", i) or re.search(r"-(\d{4})", i))
    y = year.group(1) if year else "????"
    table = {
        "Patient": f"patient/{i}.md", "Practitioner": f"patient/care-team/{i}.md",
        "Organization": f"patient/care-team/{i}.md", "Device": f"patient/devices/{i}.md",
        "Condition": f"conditions/{i}.md", "Encounter": f"encounters/{y}/{i}.md",
        "DiagnosticReport": f"reports/{y}/{i}.md", "Observation": f"observations/standalone/{y}/{i}.md",
        "Procedure": f"procedures/{i}.md", "MedicationStatement": f"medications/{i}.md",
        "AllergyIntolerance": f"allergies/{i}.md", "Immunization": f"immunizations/{i}.md",
        "CarePlan": f"plans/{i}.md", "Goal": f"plans/{i}.md",
        "DocumentReference": f"documents/{y}/{i}.md", "FamilyMemberHistory": f"family-history/{i}.md",
        "Episode": f"episodes/{i}.md",
    }
    return table.get(t)


def walk_refs(node, out):
    if isinstance(node, dict):
        for k, v in node.items():
            if k == "reference" and isinstance(v, str):
                out.append(v)
            else:
                walk_refs(v, out)
    elif isinstance(node, list):
        for v in node:
            walk_refs(v, out)


def walk_dates(node, out, key=None):
    if isinstance(node, dict):
        for k, v in node.items():
            walk_dates(v, out, k)
    elif isinstance(node, list):
        for v in node:
            walk_dates(v, out, key)
    elif key in DATE_KEYS and node is not None:
        out.append((key, str(node)))


def code_of(cc):
    try:
        return cc["coding"][0]["code"]
    except Exception:
        return None


def check_file(vault, path):
    rel = os.path.relpath(path, vault)
    name = os.path.basename(path)
    text = open(path, encoding="utf-8").read()
    fm_text, body = split_frontmatter(text)
    if name in ("index.md", "log.md"):
        if fm_text is not None and rel != "memory/index.md":
            err(rel, "reserved file must not have frontmatter")
        if rel == "memory/index.md" and fm_text is not None:
            fm = yaml.safe_load(fm_text) or {}
            if set(fm) - {"okf_version"}:
                err(rel, "bundle index frontmatter may only declare okf_version")
        check_links(vault, path, rel, text)
        return
    if fm_text is None:
        err(rel, "V1 no frontmatter")
        return
    try:
        fm = yaml.safe_load(fm_text) or {}
    except yaml.YAMLError as e:
        err(rel, f"V1 frontmatter does not parse: {e}")
        return
    if not fm.get("type"):
        err(rel, "V1 missing type")
        return
    if "status" in fm:
        err(rel, "top-level status is reserved by OKF")
    t = fm["type"]
    folder = os.path.relpath(os.path.dirname(path), os.path.join(vault, "memory"))
    folder = "" if folder in (".", "..") else folder
    if t not in TYPE_MAP:
        warn(rel, f"V2 unknown type {t!r}")
    else:
        rt, frx = TYPE_MAP[t]
        if rel != "memory.md" and not re.match(frx, folder):
            err(rel, f"V2 type {t} in wrong folder {folder!r}")
        fhir = fm.get("fhir")
        if rt:
            if not isinstance(fhir, dict):
                err(rel, "V2 clinical file has no fhir: block")
            else:
                if fhir.get("resourceType") != rt:
                    err(rel, f"V2 type {t} but resourceType {fhir.get('resourceType')}")
                check_fhir(rel, name, fhir, rt)
    vault_blk = fm.get("vault") or {}
    if t == "episode":
        ep = vault_blk.get("episode") or {}
        if ep.get("status") not in EPISODE_STATES:
            err(rel, f"V5 episode status {ep.get('status')!r}")
        anchor = ep.get("anchor")
        if anchor:
            check_ref(vault, rel, anchor)
    # vault-level references
    if isinstance(vault_blk.get("episode"), str):
        p = os.path.join(vault, "memory", "episodes", vault_blk["episode"] + ".md")
        if not os.path.exists(p):
            err(rel, f"V7 vault.episode {vault_blk['episode']} does not resolve")
    for d in vault_blk.get("documents") or []:
        check_ref(vault, rel, d)
    if vault_blk.get("rowSchema") == "lab-v1":
        check_lab_table(rel, body)
    # sources (V8)
    if t in TYPE_MAP and TYPE_MAP[t][0] and t != "patient":
        srcs = fm.get("sources") or []
        if not srcs:
            warn(rel, "V8 no sources")
        for s in srcs:
            r = (s or {}).get("resource", "")
            if r and not r.startswith("session:") and not os.path.exists(os.path.join(vault, r)):
                warn(rel, f"V8 source {r} missing")
    check_links(vault, path, rel, body)


def check_ref(vault, rel, ref):
    p = ref_to_path(ref)
    if p is None:
        err(rel, f"V7 malformed reference {ref!r}")
    elif not os.path.exists(os.path.join(vault, "memory", p)):
        err(rel, f"V7 reference {ref} does not resolve (expected memory/{p})")


def check_fhir(rel, name, fhir, rt):
    stem = name[:-3]
    if fhir.get("id") != stem:
        err(rel, f"V3 fhir.id {fhir.get('id')!r} != filename stem {stem!r}")
    if not re.match(r"^[a-z0-9-]{1,64}$", stem):
        err(rel, "V3 id has illegal characters or is over 64 chars")
    prefix, dated = PREFIX[rt]
    rx = rf"^{prefix}-\d{{8}}-[a-z0-9-]+$" if dated else rf"^{prefix}-[a-z0-9-]+$"
    if not re.match(rx, stem):
        err(rel, f"V3 id {stem!r} does not match grammar {rx}")
    if rt in STATUS_SETS and "status" in fhir and fhir["status"] not in STATUS_SETS[rt]:
        err(rel, f"V5 status {fhir['status']!r} not in R4 value set")
    if rt == "Condition":
        cs = code_of(fhir.get("clinicalStatus") or {})
        vs = code_of(fhir.get("verificationStatus") or {})
        if cs and cs not in CLINICAL:
            err(rel, f"V5 clinicalStatus {cs!r}")
        if vs and vs not in VERIF:
            err(rel, f"V5 verificationStatus {vs!r}")
        if any(k.startswith("abatement") for k in fhir) and cs not in {"inactive", "resolved", "remission"}:
            err(rel, "V6 abatement present but clinicalStatus not inactive/resolved/remission")
        if vs == "entered-in-error" and cs:
            err(rel, "V6 clinicalStatus must be absent when entered-in-error")
    refs = []
    walk_refs(fhir, refs)
    for r in refs:
        if r.startswith(("http", "urn:", "#")):
            continue
        check_ref(VAULT, rel, r)
    dates = []
    walk_dates(fhir, dates)
    for k, v in dates:
        if not ISO.match(v):
            err(rel, f"V9 {k} {v!r} is not ISO 8601")


def check_lab_table(rel, body):
    lines = [l.strip() for l in body.splitlines()]
    try:
        h = next(i for i, l in enumerate(lines) if l.startswith("| Analyte"))
    except StopIteration:
        err(rel, "V9 lab-v1 file has no results table")
        return
    header = [c.strip() for c in lines[h].strip("|").split("|")]
    want = ["Analyte", "Code", "Value", "Unit", "Range", "Flag", "Note"]
    if header != want:
        err(rel, f"V9 lab-v1 header {header} != {want}")
    for l in lines[h + 2:]:
        if not l.startswith("|"):
            break
        cells = [c.strip() for c in l.strip().strip("|").split("|")]
        if len(cells) != 7:
            err(rel, f"V9 lab-v1 row has {len(cells)} cells: {l}")
            continue
        code, flag = cells[1], cells[5]
        if code and not re.match(r"^loinc:\d{1,7}-\d$", code):
            err(rel, f"V9 code {code!r} not loinc:NNNN-N")
        if flag not in FLAGS:
            err(rel, f"V9 flag {flag!r} not in {sorted(FLAGS)}")


LINK = re.compile(r"\]\(([^)\s]+)\)")


def check_links(vault, path, rel, text):
    text = re.sub(r"```.*?```", "", text, flags=re.S)
    text = re.sub(r"<!--.*?-->", "", text, flags=re.S)
    text = re.sub(r"`[^`\n]*`", "", text)
    for m in LINK.finditer(text):
        target = m.group(1).split("#")[0]
        if not target or target.startswith(("http:", "https:", "mailto:")):
            continue
        p = os.path.normpath(os.path.join(os.path.dirname(path), target))
        if not os.path.exists(p):
            err(rel, f"V7 broken link {target}")


def main():
    global VAULT
    VAULT = os.path.abspath(sys.argv[1])
    files = [os.path.join(VAULT, "memory.md")]
    for d, _, fs in os.walk(os.path.join(VAULT, "memory")):
        files += [os.path.join(d, f) for f in fs if f.endswith(".md")]
    for f in sorted(files):
        if os.path.exists(f):
            check_file(VAULT, f)
        else:
            err(os.path.relpath(f, VAULT), "missing")
    for line in ERRORS + WARNS:
        print(line)
    print(f"\n{len(files)} files checked: {len(ERRORS)} errors, {len(WARNS)} warnings")
    sys.exit(1 if ERRORS else 0)


VAULT = ""
if __name__ == "__main__":
    main()
