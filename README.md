# coder-helper README

using for escape/unescape text string
using for splite/merge url query string
format curl command

## Features

### escape string

    abc say :"hello" ==> "abc say :\"hello\""

### unescape string

    "abc say :\"hello\"" ==> abc say :"hello"

### splite url query

    a=10&b=23&c=45
    ===== convert to =>
    a=10&
    b=23&
    c=45

### url merge

    a=10&
    b=23&
    c=45
    ===== convert to =>
    a=10&b=23&c=45

### format curl

    curl -H "Host: www.google.com" --data "a=1&b=2&c=3" https://google.com
    ===== convert to =>
    curl \
    -H "Host: www.google.com" \
    --data "a=1&b=2&c=3" \
    https://google.com

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.


## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 0.0.2

Initial release
