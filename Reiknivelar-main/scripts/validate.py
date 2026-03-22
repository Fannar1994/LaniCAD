#!/usr/bin/env python3
"""Validate all calculator HTML files for required patterns and conventions."""

import glob
import sys
import os

def validate_html(filepath):
    """Check a single HTML file for required elements.

    Returns (errors, warnings) tuple.
    Errors cause validation failure; warnings are informational.
    """
    filename = os.path.basename(filepath)
    errors = []
    warnings = []

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Required meta tags
    if 'charset="UTF-8"' not in content:
        errors.append(f'{filename}: Missing charset="UTF-8"')

    if 'name="viewport"' not in content:
        errors.append(f'{filename}: Missing viewport meta tag')

    # Language attribute
    if 'lang="is"' not in content:
        errors.append(f'{filename}: Missing lang="is" attribute')

    # Favicon
    if 'favicon_io/favicon.ico' not in content:
        errors.append(f'{filename}: Missing favicon link')

    # var declarations in script (warning only – legacy code uses var)
    var_count = 0
    lines = content.split('\n')
    in_script = False
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        if '<script' in stripped:
            in_script = True
        if '</script>' in stripped:
            in_script = False
        if in_script and stripped.startswith('var '):
            var_count += 1
    if var_count > 0:
        warnings.append(f'{filename}: {var_count} var declarations (prefer const/let in new code)')

    return errors, warnings


def validate_index(filepath):
    """Check index.html has cards for all calculators."""
    errors = []
    calculators = [
        'Girdingar_reiknivel.html',
        'hjolapallar_reiknivel_sp.html',
        'loftastodir.html',
        'motareiknivel-byko-v11.html',
        'vinnupalla-reiknivel_new.html',
    ]

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    for calc in calculators:
        if calc not in content:
            errors.append(f'index.html: Missing link to {calc}')

    return errors


def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    all_errors = []
    all_warnings = []

    # Validate all HTML calculator files
    for html_file in sorted(glob.glob(os.path.join(root, '*.html'))):
        filename = os.path.basename(html_file)
        if filename == 'index.html':
            all_errors.extend(validate_index(html_file))
        errors, warnings = validate_html(html_file)
        all_errors.extend(errors)
        all_warnings.extend(warnings)

    if all_warnings:
        print('Warnings:')
        for warn in all_warnings:
            print(f'  - {warn}')
        print()

    if all_errors:
        print('Validation FAILED:')
        for err in sorted(all_errors):
            print(f'  - {err}')
        sys.exit(1)
    else:
        print('All HTML files pass validation.')
        sys.exit(0)


if __name__ == '__main__':
    main()
