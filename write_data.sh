#!/bin/bash

# A sample script to test things out
# ./write_data.sh <MAC> <VALUE>
gatttool -b $1 --handle 0x002b --value $2 --char-write
