#!/usr/bin/perl -ln
$n = s/\.png/.jpg/r;
system "convert $_ -crop +6+1 -contrast-stretch 0 $n";
