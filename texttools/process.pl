#!/usr/bin/perl -l
@aff = << "END" =~ /(.+)/g;
Avengers
Brotherhood
Cabal
Crime Syndicate
Fantastic Four
Foes of Asgard
Guardians of the Galaxy
HYDRA
Illuminati
Marvel Knights
Mercs for Money
New Warriors
S.H.I.E.L.D.
Sinister Six
Spider Friends
(Unaffiliated)
X-Force
X-Men
END
$aff = "(?:".(join'|',map s/[().]/\\$&/gr, @aff).")";
$class = "(?:Instinct|Ranged|Tech|Covert|Strength)";

open A, "input.html";
while (<A>) {
  @a = split/<span style="font-size: 16pt;"><b>/;
  @a < 2 and next;
  shift @a;
  for (@a) {
    /(.*?)<.b><.span>(.*)/;
    ($name, $_) = ($1, $2);
    $name =~ s/ /_/g;
    $name .= ".txt";
    s!<span style="background-color: #......;"><span style="color: #......;">($class)</span></span>![$1]!g;
    s!<b>(Bribe|Soaring Flight|Dodge)</b>!'{'.(uc$1).'}'!ge;
    my @lines = split m!<br />!;
    for (@lines) {
      s!^== (.*?) ==$!#EXPANSION: $1! && next;
      s!^Cost: ?(.*?)$!#COST: $1! && next;
      s!^((1/2|\d+( 1/2)?)\+?) Attack$!#ATTACK: $1! && next;
      s!^((1/2|\d+( 1/2)?)\+?) Recruit$!#RECRUIT: $1! && next;
      s!^<i>5th Circle of Kung-Fu</i> \(2 copies\)$!<i>5th Circle of Kung-Fu</i>!; #FIX
      s!^<i>(.*?)</i> \((\d+) cop(ies|y)\)$!#SUBNAME: $1\n#COPIES: $2! && next;
      s!^(\[$class\])$!#CLASS: $1! && next;
      s!^($aff)$!#TEAM: $1! && next;
      s!^(Bribe|Feast)$!'{'.(uc$1).'}'!e && next;

      s!^($aff): (.*)$!{TEAMPOWER $1} $2! && next;
      s!^\[($class)\]: (.*)$!{POWER $1} $2! && next;
      s!^\[($class)\],? \[($class)\]: (.*)$!{POWER $1 $2} $3! && next;
      s!^\[($class)\], \[($class)\], \[($class)\], \[($class)\]: (.*)$!{POWER $1 $2 $3 $4} $5! && next;
      s!^<b>(?:Healing|Betrayal)</b>: (.*)!#HEAL: $1! && next;

      s!^<i>(PhD in Oceanography)</i>$!#SUBNAME: $1\n#COPIES: 1! && next; #FIX
      s!^Unbreakable Cage$!#SUBNAME: $&\n#COPIES: 3! && next; #FIX
      s!^(Weight of the World) \(1 copy\)$!#SUBNAME: $&\n#COPIES: 1! && next; #FIX

      s!^<span style="font-size: 10pt;"><i><b>(.*?)</b></i></span>( \(first print run promo\))?$!#CARDNAME: $1! && next;
      s!^<span style="font-size: 10pt;"><i><b>(.*?)</b>(</i></span>)? \((\S+) cop(y|ies)( in starting deck)?\)(</i></span>)?$!#CARDNAME: $1\n#COPIES: $3! && next;
      s!^<span style="font-size: 8pt;"><i>Art contains a gun.*</i></span>!#GUN: 1! && next;
      s!^<span style="font-size: 8pt;"><i>(Flavor: )?(.*)</i></span>!#FLAVOR: $2! && next;

      s!^<a.*?>\(jump to top\)</a>$!! && next;
    }
    $_ = join"\n",@lines;
    if ($name =~ /^Bystanders/) {
      s!^(<b>)?VP(</b>)?: (\d+)$!#VP: $3!gm;
      s!^When you (?:rescue|kidnap) this Bystander,(?: |\n)(.*)!#RESCUE: $1!gm;
    }
    if ($name =~ /^Hench/) {
      s!^<b>(VP|Attack|Fight|Escape|Ambush)</b>: (.*)!"#" . uc($1) . ": $2"!gme;
      s!^Ambush: (.*)!#AMBUSH: $1!gm; #FIX
    }
    if ($name =~ /^Villains/) {
      s!^<i>Teleport</i>$!{TELEPORT}!m; #FIX
      s!^Burrow$!{BURROW}!;
      s!^<b>(VP|Attack|Fight|Escape|Ambush):?</b>:? ?(.*)!"#" . uc($1) . ": $2"!gme;
    }
    if ($name =~ /^Masterminds/) {
      s!^(?:<[bi]>)?Attack(?:</[bi]>)?: (.*)!#ATTACK: $1!gm;
      s!^(?:<[bi]>)?VP(?:</[bi]>)?: (.*)!#VP: $1!gm;
      s!^<[bi]>Always Leads(?::</[bi]>|</[bi]>:) (.*)!#LEADS: $1!gm;
      s!^<[bi]>Master Strike(?::</[bi]>|</[bi]>:) (.*)!#STRIKE: $1!gm;
      s!^<b>((?:Epic )?Vulture)</b>$!<i>$1</i>!gm; #FIX
      s!^\n<i>(.*?)</i>$!\n#TACTIC: $1!gm;
      s!^<b>Fight(?::</b>|</b>:) (.*)$!#FIGHT: $1!gm;
      s!^<b>Start of Game</b>: (.*)$!#START: $1!gm;
    }
    if ($name =~ /^Hero/) {
#      s!^#CARDNAME: .*\n($aff|$aff/$aff)\n(#GUN: 1\n)?\n(#SUBNAME: .*\n#COPIES: \d\n\[$class\](, \[$class\])?\n(.+\n)+\n+){4}!OK $3\n!gm
    }
    print "$name";
    open B,">$name";
    print B $_;
    close B;
  }
}
