#!/bin/bash

gatttool -b $1 --handle 0x002b --value $2 --char-write
