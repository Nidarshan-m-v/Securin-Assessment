#!/usr/bin/env python3
"""
json2xml.py

Usage:
    python json2xml.py input.json output.xml

Converts a JSON file to XML following the spec:
- XML element tag names are based on JSON types: object, array, string, number, boolean, null
- If a JSON value is a member of an object, the produced XML element gets a name="key" attribute
- Arrays' child elements do NOT receive name attributes
- null -> self-closing <null/> (or <null name="..."/> if from object)
- Boolean values are "true"/"false" lowercase
- Output is compact (no extra whitespace/newlines) to match examples
"""
import sys
import json
from xml.sax.saxutils import escape

def escape_attr(s: str) -> str:
    # Escape XML attribute value; also escape double-quote for safety
    return escape(s, {'"': '&quot;'})


def to_xml(value, key=None):
    """
    Recursively convert a Python JSON-decoded value into XML string.
    `key` is the member name if this value came from an object (otherwise None).
    """
    # Helper to prepare name attribute when key provided
    name_attr = f' name="{escape_attr(str(key))}"' if key is not None else ''

    # Objects (dict)
    if isinstance(value, dict):
        inner = ''.join(to_xml(v, k) for k, v in value.items())
        return f'<object{name_attr}>{inner}</object>'

    # Arrays (list)
    if isinstance(value, list):
        inner = ''.join(to_xml(v, None) for v in value)
        return f'<array{name_attr}>{inner}</array>'

    # null / None
    if value is None:
        return f'<null{name_attr}/>'

    # Booleans (must check before numbers because bool is subclass of int)
    if isinstance(value, bool):
        text = 'true' if value else 'false'
        return f'<boolean{name_attr}>{text}</boolean>'

    # Numbers (int, float)
    if isinstance(value, (int, float)):
        # Represent as Python's standard numeric literal (keeps -17.4 etc.)
        # Avoid scientific notation surprises by using str(value)
        return f'<number{name_attr}>{str(value)}</number>'

    # Strings
    if isinstance(value, str):
        # Escape special characters for XML content
        return f'<string{name_attr}>{escape(value)}</string>'

    # Unexpected types (shouldn't occur for JSON)
    raise TypeError(f'Unsupported JSON type: {type(value)}')


def main():
    if len(sys.argv) != 3:
        print("Usage: python JsonToXml.py input.json output.xml")
        sys.exit(2)

    in_path, out_path = sys.argv[1], sys.argv[2]

    try:
        with open(in_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f'Error reading JSON: {e}', file=sys.stderr)
        sys.exit(1)

    # Only arrays or objects allowed at top level per spec
    if not isinstance(data, (dict, list)):
        print('Top-level JSON must be an object or an array.', file=sys.stderr)
        sys.exit(1)

    xml = to_xml(data, None)

    # Write output file (compact, no XML prolog since example didn't include one)
    try:
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(xml)
    except Exception as e:
        print(f'Error writing XML: {e}', file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
