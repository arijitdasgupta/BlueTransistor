#!/bin/bash

# A sample script to test things out
# ./write_data.sh <MAC> <ADDR> <VALUE>
gatttool -b $1 --handle $2 --value $3 --char-write
