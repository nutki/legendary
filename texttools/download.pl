#!/bin/perl
$_ = `wget 'https://boardgamegeek.com/wiki/page/Legendary_Marvel_Complete_Card_Text' -O-`;
s!<p>Now located at the <a class="" href="(.*?)"!`wget 'https://boardgamegeek.com$1' -O-`!ges;
open A, ">input.html";
print A $_;
close A;
