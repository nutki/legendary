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
Champions
Warbound
Venomverse
END
$aff = "(?:".(join'|',map s/[().]/\\$&/gr, @aff).")";
$class = "(?:Instinct|Ranged|Tech|Covert|Strength)";
%IMG = (
  26283 => 'Covert',
  26284 => 'Instinct',
  26285 => 'Ranged',
  26286 => 'Strength',
  26287 => 'Tech',
);
$imgkeys = "(?:".(join"|",keys%IMG).")";

open A, "input.html";
undef $/;
while (<A>) {
  s/\bstrong>/b>/g;
  s/\bem>/i>/g;
  s/<!--.*?-->//g;
  s/'(<[bi]>)(\d)/$1'$2/g;
  s/&quot;/"/g;
  s/&deg;/°/g;
  s/&ndash;/–/g;
  s/&rsquo;/’/g;
  s/&amp;/&/g;
  s/&hellip;/…/g;
  s/&ldquo;/“/g;
  s/&rdquo;/”/g;
  s/&reg;/®/g;
  s/<img .*?_(\d+)_.*?>/{IMG $1}/g;
  s/{IMG ($imgkeys)}/[$IMG{$1}]/g;
  @a = split/<h2><b>/;
  shift @a;
  for (@a) {
    /(.*?)<.b><.h2><.p>(.*<).div><.div>/s;
    ($name, $_) = ($1, $2);
    $name =~ s/ /_/g;
    $name .= ".txt";
    s!(: ?)</b>!</b>$1!g; #FIX
    s!<b>(Bribe|Soaring Flight|Dodge|Versatile( \d+)?|Wall-Crawl|Teleport|Lightshow|Phasing)</b>!'{'.(uc$1)=~s/-//gr.'}'!ge;
    s!<b>Cross-Dimensional (.*?) Rampage</b>!{XDRAMPAGE $1}!g;
    s!<b>Rise of the Living Dead</b>!{RISEOFTHELIVINGDEAD}!g;
    s!<b>Patrol( the)? (.*?)</b>!{PATROL $2}!g;
    s!<b>Fateful Resurrection</b>!{FATEFULRESURRECTION}!g;
    s!<b>Charge</b>!{CHARGE}!g;
    s!<b>Savior</b>:!{SAVIOR}!g;
    s!<b>(Man|Woman) Out of Time</b>!{OUTOFTIME}!g;
    s!<[bi]>(\d+)(st|rd|th) Circle of (Kung|Quack)-Fu</[bi]>!{NTHCIRCLE $1}!g;
    s!<b>Size-Changing</b>: \[($class)\]!'{SIZECHANGING '.(uc$1).'}'!ge;
    s!Size-Changing: ($class)!'{SIZECHANGING '.(uc$1).'}'!ge; # FIX CW villains
    s!(<b>)S.H.I.E.L.D. Clearance(</b>)!{SHIELDCLEARANCE}!g; #FIX? no formatting in most cases
    my @lines = split m!<br />\n?|<p>\n?|</p>\n?!;
    for (@lines) {
      s!.*?<h3>(.*?)(\s*\(.*\))?<.h3>!#EXPANSION: $1!s && next;
      s!^Cost: ?(.*?)$!#COST: $1! && next;
      s!^((1/2|\d+( 1/2)?)\+?) Attack$!#ATTACK: $1! && next;
      s!^((1/2|\d+( 1/2)?)\+?) Recruit$!#RECRUIT: $1! && next;
      s!^<i>(.*?)</i> \((\d+) cop(ies|y)\)$!#SUBNAME: $1\n#COPIES: $2! && next;
      s!^(\[$class\](, \[$class\])?)$!#CLASS: $1! && next;
      s!^Class: (\[$class\](/\[$class\])?)$!#CLASS: $1! && next;
      s!^(?:Team: )?($aff)$!#TEAM: $1! && next;
      s!^(?:Team: )?($aff)/($aff)$!#TEAM: $1 | $2! && next;
      s!^(Bribe|Feast)$!'{'.(uc$1).'}'!e && next;
      s!^<b>Focus (\d+) Recruit -&gt;</b>!{FOCUS $1}! && next;

      s!^($aff): (.*)$!{TEAMPOWER $1} $2! && next;
      s!^($aff),? ($aff): (.*)$!{TEAMPOWER $1, $2} $3! && next;
      s!^($aff),? ($aff),? ($aff): (.*)$!{TEAMPOWER $1, $2, $3} $4! && next;
      s!^($aff),? ($aff),? ($aff),? ($aff): (.*)$!{TEAMPOWER $1, $2, $3, $4} $5! && next;
      s!^\[($class)\]: (.*)$!{POWER $1} $2! && next;
      s!^\[($class)\],? \[($class)\]: (.*)$!{POWER $1 $2} $3! && next;
      s!^\[($class)\], \[($class)\], \[($class)\], \[($class)\]: (.*)$!{POWER $1 $2 $3 $4} $5! && next;
      s!^<b>(?:Healing|Betrayal)</b>: (.*)!#HEAL: $1! && next;
      s!^<b>Spectrum</b>: (.*)$!{SPECTRUM} $1! && next;

      s!^<span style='font-size:14px;'><i><b>(.*?)</b></i></span>( \(first print run promo\))?$!\n#CARDNAME: $1!s && next;
      s!^<span style='font-size:14px;'><i><b>(.*?)</b>(</i></span>)? \((\S+) cop(y|ies)( in starting deck)?\)(</i></span>)?$!\n#CARDNAME: $1\n#COPIES: $3!s && next;
      s!^<span style='font-size:8px;'><i>Art contains a gun.*</i></span>!#GUN: 1! && next;
      s!^<span style='font-size:8px;'><i>(Flavor: )?(.*)</i></span>!#FLAVOR: $2! && next;

    }
    $_ = join"\n",@lines;
    if ($name =~ /^Bystanders/) {
      s!#ATTACK:!#ATTACKG:!g;
      s!^---$!#GAINABLE!mg;
      s!^(<b>)?VP(</b>)?: (\d+)$!#VP: $3!gm;
      s!^When you (?:rescue|kidnap) this Bystander,(?: |\n)(.*)!#RESCUE: $1!gm;
    }
    if ($name =~ /^Hench/) {
      s!#ATTACK:!#ATTACKG:!g;
      s!^---$!#GAINABLE!mg;
      s!^<b>(VP|Attack|Fight|Escape|Ambush)</b>: (.*)!"#" . uc($1) . ": $2"!gme;
      s!^Ambush: (.*)!#AMBUSH: $1!gm; #FIX
    }
    if ($name =~ /^Villains/) {
      s!#ATTACK:!#ATTACKG:!g;
      s!^---$!#GAINABLE!mg;
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
      s!^<i>(.*?)</i>$!\n#TACTIC: $1!gm;
      s!^<b>Fight(?::</b>|</b>:) (.*)$!#FIGHT: $1!gm;
      s!^<b>Start of Game</b>: (.*)$!#START: $1!gm;
    }
    if ($name =~ /^Schemes/) {
      s!^<b>Setup(?:</b>:|:</b>) (.*)!#SETUP: $1!gm;
      s!^<b>Twist(?:</b>:|:</b>) (.*)!#TWIST: $1!gm;
      s!^<b>Twists? (\d+(?:-\d+|(?:, (?:and )?\d+)+)?)(?:</b>:|:</b>) (.*)!#TWISTNR: NR[$1] $2!gm;
      s!^Other Twists: (.*)!#TWISTELSE: $1!gm;
      s!^<b>Special Rules(?:</b>:|:</b>) (.*)!#RULE: $1!gm;
      s!^<b>(?:Good|Evil) Wins(?:</b>:|:</b>) (.*)!#EVILWINS: $1!gm;
    }
    if ($name =~ /^Hero/) {
      s!<b>Divided</b>\n<i>(.*?)(?: \((.*?)(?:: (.*?))?\))?</i>\n(.*?)---\n<i>(.*?)(?: \((.*?)(?:: (.*?))?\))?</i>\n(.*?)\n\n!
        my $lhero = $2 && "#DIVHERO: $2\n";
        my $lteam = $3 && "#DIVTEAM: $3\n";
        my $rhero = $6 && "#DIVHERO: $6\n";
        my $rteam = $7 && "#DIVTEAM: $7\n";
        print STDERR "Divided $1|$2|$3 ---- $5|$6|$7"; "#DIVIDED: $1\n$lhero$lteam$4#DIVIDED: $5\n$rhero$rteam$8\n\n"
      !sge;
      s!^<b>Divided.*\n.*!!mg and print STDERR "BUU $&";
#      s!^#CARDNAME: .*\n($aff|$aff/$aff)\n(#GUN: 1\n)?\n(#SUBNAME: .*\n#COPIES: \d\n\[$class\](, \[$class\])?\n(.+\n)+\n+){4}!OK $3\n!gm
    }
    if ($name =~ /^Keywords/) {
      s/^\s*<li>\s*(.*?)<.li>/* $1/mg;
      s/^\s*<.?ul>\s*\n//mg;
    }
    s/\n\n+/\n\n/g;
    print "$name";
    while(/^#EXPANSION: (.*)\n(((?!#EXPANSION:).*\n)*)/mg) {
      mkdir $1 unless -e $1;
      open B,">$1/$name";
      print B $2;
      close B;
    }
  }
}
