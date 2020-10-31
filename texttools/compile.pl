#!/usr/bin/perl
%input = (
  HENCHMEN => "Henchmen_and_Backup_Adversaries.txt",
  HEROES => "Heroes_and_Allies.txt",
  VILLAINS => "Villains_and_Adversaries.txt",
  BYSTANDERS => "Bystanders.txt",
  MASTERMINDS => "Masterminds_and_Commanders.txt",
  SCHEMES => "Schemes_and_Plots.txt",
  SIDEKICKS => "Sidekicks_and_New_Recruits.txt",
  AMBITIONS => "Ambitions.txt",
  WOUNDS => "Wounds_and_Bindings.txt",
  HORRORS => "Horrors.txt",
  OFFICERS => "Setup_Cards.txt",
);
my ($type, $exp) = @ARGV;
my $file = $input{$type};
open A, "<$exp/$file";
undef $/;
$_ = <A>;
close A;
#print length,"\n";
sub autopower {
  my %num = (a => '', another => '', two => ', 2', three => ', 3');
  my %filt = (card => 'undefined', Wound => 'isWound');
  my @a = split"\n",shift;
  my @r = ();
  my @ar = ();
  for (@a) {
    /^#|^$/ and next;
    my $effect = undef;
    my $cond = undef;
    my $wrap = undef;
    my $ability = undef;
    my $ind = 0;
    s/^{POWER (.*?)} *// and $cond = "superPower(".(join', ',map{"Color.".uc}split" ",$1).")";
    s/^{TEAMPOWER (.*?)} *// and $cond = "superPower(".(join', ',map{"\"$_\""}split", ",$1).")";
    s/^{SPECTRUM} *// and $cond = "spectrumPower()";
    s/^{SAVIOR} *// and $cond = "saviorPower()";
    s/^{XGENE \[(.*?)\]} *// and $cond = "xGenePower(Color.".(uc$1).")";
    s/^{XGENE (.*?)} *// and $cond = "xGenePower(\"$1\")";
    s/^{VIOLENCE} *// and $wrap = "excessiveViolence: ev => XXX";
    s/^{SHIELDLEVEL (.*?)} *// and $cond = "shieldLevelPower($1)";
    s/^If you are \{WORTHY\},? *// and $cond = "worthyPower()";
    s/^{SUNLIGHT} *// and $cond = "sunlightPower()";
    s/^{MOONLIGHT} *// and $cond = "moonlightPower()";
    s/^{WHEN RECRUITED} *// and $wrap = "whenRecruited: ev => XXX";

    s/^You may KO a (card|Wound) from your hand or discard pile\. If you do, (.)/uc$2/e and $wrap = "KOHandOrDiscardEv(ev, $filt{$1}, () => XXX)";
    s/^{PATROL (Sewers|Bank|Streets|Rooftops|Bridge)}: If it's empty, (.)/uc$2/ei and $wrap = "patrolCity('".(uc$1)."', () => XXX)";
    s/^{FOCUS (\d+)} +// and $wrap = "setFocusEv(ev, $1, ev => XXX)";
    s/^{LIGHTSHOW} *// and $wrap = "lightShow: ev => XXX, cardActions: [ lightShowActionEv ]";
    s/^{OUTWIT}: *// and $wrap = "mayOutwitEv(ev, () => XXX)";
    s/^{DIGEST (\d)} *// and $wrap = "digestEv(ev, $1, () => XXX)";
    s/^{INDIGESTION} *// and $wrap = "() => XXX", $ind = 1;

    /^You may KO a (card|Wound) from your hand or discard pile\.?/ and $effect = "KOHandOrDiscardEv(ev, $filt{$1})";
    /^Draw (a|another|two|three) cards?\.?$/ and $effect = "drawEv(ev$num{$1})";
    /^[Yy]ou get \+(\d+) (Attack|Recruit)\.?$/ and $effect = "add$2Event(ev, $1)";
    /^("?Rescue"?|Kidnap) a Bystander\.?$/ and $effect = "rescueEv(ev)";
    /^[Gg]ain a(nother)? Sidekick\.?$/ and $effect = "gainSidekickEv(ev)";
    /^{OUTOFTIME}\.?$/ and $effect = "outOfTimeEv(ev)";
    /^{VERSATILE (\d+)}$/ and $effect = "versatileEv(ev, $1)";
    s/^{WALLCRAWL}$// and $ability = 'wallcrawl: true';
    s/^{TELEPORT}$// and $ability = 'teleport: true';
    s/^{DODGE}$// and $ability = 'cardActions: [ dodge ]';
    s/^{PHASING}$// and $ability = 'cardActions: [ phasingActionEv ]';
    s/^{SIZECHANGING (.+?)}$// and $ability = "sizeChanging: ".(join' | ',map{"Color.".$_}split" ",$1);
    s/^{USIZECHANGING (\w+) (\d+)}$// and $ability = "uSizeChanging: { color: Color.$1, amount: $2 }";
    s/^(\d+)\+? Piercing$// and $ability = "printedPiercing: $1";
    s/^[Yy]ou get \+(\d+) Piercing\.?$// and $effect = "addPiercingEv(ev, $1)";
    s/^{BERSERK}(, \{BERSERK})*$// and $effect = "berserkEv(ev, ".((@zzz=$&=~/BERSERK/g)).")";
    s/^{SOARING FLIGHT}$// and $ability = "soaring: true";
    s/^{COORDINATE}$// and $ability = "coordinate: true";
    s/^{STRIKER (\d+)}$// and $effect = "strikerHeroEv(ev, $1)";
    s/^{DANGERSENSE (\d+)}($|\. If this revealed (.*)$)// and $effect = "dangerSenseEv(ev, $1" . ($2 ? ", cards => {/* TODO $3 */})" : ")");
    s/^{CHEERING CROWDS}$// and $ability = "cheeringCrowds: true";
    s/^{WOUNDED FURY}$// and $effect = "woundedFuryEv(ev)";
    s/^{SMASH (\d)}$// and $effect = "smashEv(ev, $1)";
    s/^{SWITCHEROO (\d+)}$// and $ability = "cardActions: [ switcherooActionEv($1) ]";
    s/^{DARK MEMORIES}$// and $effect = "darkMemoriesEv(ev)";
    s/^{LAST STAND}$// and $effect = "lastStandEv(ev)";
    s/^{HYPERSPEED (\d+)}$// and $effect = "hyperspeedEv(ev, $1)";
    s/^{(\w+) CONQUEROR (\d+)}$// and $effect = "heroConquerorEv(ev, '$1', $2)";
    s/^{HIGEST ABOMINATION}$// and $effect = "heroHighestAbominationEv(ev)";
    s/^{(\w+) ABOMINATION}$// and $effect = "heroAbominationEv(ev, '$1')";

    $effect ||= "0/* TODO */" if $_;
    $effect = $wrap =~ s/XXX/$effect/r if $wrap && $effect;
    $effect = "$cond && $effect" if $cond && $effect;
    $effect =~ /^\w+: / and ($effect, $ability) = (undef, $effect);
    $ind and @r[-1] =~ s/\)$/, $effect)/, $effect = undef;
    push @r, $effect if $effect;
    push @ar, $ability if $ability;
    #print "$_\n" if !$effect;
  }
  my $all = join', ',map"ev => $_",@r;
  my $powers = @r ? @r > 1 ? ", [ $all ]" : ", $all" : "";
  my $aall = join', ',@ar;
  @ar ? ($powers || ', []') . ", { $aall }" : $powers;
}
sub gainable() {
  /GAINABLE/ or return ();
  my $attack = $_{ATTACKG} =~ s! ?1/2!.5!gr =~ s/[^0-9.]//gr;
  my $recruit = $_{RECRUIT} =~ s! ?1/2!.5!gr =~ s/[^0-9.]//gr;
  my $class = $_{CLASS} =~ s/\[(.*)\]/uc$1/er;
  my $pteam = $_{TEAM} ? "\"$_{TEAM}\"" : 'u';
  my $autopower = autopower($_);
  $attack = 'u' if $attack eq '';
  $recruit = 'u' if $recruit eq '';
  my $flags = '';
  # Deadpool flags
  $flags .= 'G' if $_{GUN};
  $flags .= 'F' if $_{FLAVOR};
  $flags .= 'D' if /2/;
  return ("makeGainableCard(", ", $recruit, $attack, Color.$class, $pteam, \"$flags\"$autopower)");
}
sub makehero {
  my ($heroname, $pteam) = @_;
  my $autopower = autopower($_);
  parse();
  my $heroname2 = $_{DIVHERO} || $heroname;
  my $cardname = $_{DIVIDED} || $_{SUBNAME} || $_{CARDNAME};
  my $pteam2 = $_{DIVTEAM} ? $_{DIVTEAM} eq "(Unaffiliated)" ? 'u' : "\"$_{DIVTEAM}\"" : $pteam;
#  $_{COPIES} == $count or die "Bad number of copies for $pname: $_{COPIES}";
  filterprint(qw(SUBNAME CLASS ATTACK RECRUIT COST FLAVOR CARDNAME TEAM));
  my $attack = $_{ATTACK} =~ s! ?1/2!.5!gr =~ s/[^0-9.]//gr;
  my $recruit = $_{RECRUIT} =~ s! ?1/2!.5!gr =~ s/[^0-9.]//gr;
  my $cost = $_{COST} =~ s/[^0-9]//gr;
  my $class = join' | ',map{'Color.'.uc}($_{CLASS} =~ /\[(\w+)\]/g);
  $attack = 'u' if $attack eq '';
  $recruit = 'u' if $recruit eq '';
  my $flags = '';
  # Deadpool flags
  $flags .= 'G' if $hasgun || $_{GUN};
  $flags .= 'F' if $_{FLAVOR};
  $flags .= 'D' if /2/ || $heroname =~ /2/;
  # SW1 Black Bolt flag (no rules text)
  $flags .= 'N' if !/^[^#]/m;
  return "makeHeroCard(\"$heroname2\", \"$cardname\", $cost, $recruit, $attack, $class, $pteam2, \"$flags\"$autopower)";
}
sub maketrap {
  my ($groupname) = @_;
  filterprint(qw(TRAP TRAPEFFECT TRAPCOND AMBUSH VP));
  print "  [ $_{COPIES}, makeTrapCard(\"$groupname\", \"$_{SUBNAME}\", $_{VP},";
  print "\n    // $_{AMBUSH}\n    ev => {},\n" if $_{AMBUSH};
  print " u,\n" if !$_{AMBUSH};
  print "    // $_{TRAPCOND}\n    ev => true,\n";
  print "    // $_{TRAPEFFECT}\n    ev => {},\n";
  print "  )],\n";
}
  $content = $_;
  #print length$content, "\n";
  $content =~ s/^\n+//;
  @items = map{s/\n+$/\n/r}split /^(?=#CARDNAME)/m, $content;
  #print join"====\n",@items;
  sub parse {
    %_ = ();
    /#(\w+): (.*)/ ? ($_{$1} = $_{$1} ? "$_{$1}|$2" : $2) : ($_{ABILITIES} .= $_) for split /\n/;
    s!^#COPIES:.*\n!!mg;
  }
  sub filterprint {
    my $f = join'|',@_;
    print s!^#($f):.*\n!!mgr =~ s!^#?(.*\n)!// $1!mgr;
  }
  my $henchmenGroup = "";
  %atm = qw(HEROES Hero VILLAINS Villain BYSTANDERS Bystander HENCHMEN Henchmen);
  print "addTemplates(\"$type\", \"$exp\", [\n" =~ s/Templates\("(HEROES|VILLAINS|BYSTANDERS|HENCHMEN)", /$atm{$1}Templates(/r;
  for (@items) {
    if ($type eq "HENCHMEN") {
      parse();
      my ($gs, $ge) = gainable();
      my $attack = $_{ATTACK} =~ s/[^0-9]//gr;
      if (!$_{VP}) {
        $henchmenGroup = ', "' . $_{CARDNAME} . '"';
        print "{cards:[\n";
        next;
      }
      filterprint(qw(CARDNAME VP COPIES));
      if (!$_{COPIES}) {
        print "]}\n" if $henchmenGroup;
        $henchmenGroup = "";
      } else {
        print "[$_{COPIES}, ";
        $ge .= "]";
      }
      print "${gs}makeHenchmenCard(\"$_{CARDNAME}\", $attack, {\n";
      print "  fight: ev => { },\n" if $_{FIGHT};
      print "  ambush: ev => { },\n" if $_{AMBUSH};
      print "}$henchmenGroup)$ge,\n";
      $_{VP} == 1 || $_{FIGHT} eq "Gain this as a Hero." or die "VP is not 1: $_{VP}";
    } elsif ($type eq "BYSTANDERS") {
      parse();
      my ($gs, $ge) = gainable();
      filterprint(qw(CARDNAME VP COPIES));
      $copies = $_{COPIES} * 1 || 1;
      print "[ $copies, ${gs}makeBystanderCard(\"$_{CARDNAME}\"";
      print ", ev => {}" if $_{RESCUE};
      print ")$ge ],\n";
      $_{VP} == 1 || !defined($_{VP}) or die "VP is not 1: $_{VP}";
    } elsif ($type eq "SIDEKICKS" or $type eq "OFFICERS") {
      parse();
      $copies = $_{COPIES} * 1 || 1;
      my $h = makehero($type eq "SIDEKICKS" ? "Special Sidekick" : "S.H.I.E.L.D. Officer", "\"$_{TEAM}\"");
      print "[ $copies, $h ],\n";
    } elsif ($type eq "HEROES") {
      ($_, my @subitems) = split/^\n+/m;
      parse();
      my $heroname = $_{CARDNAME};
      my $team = $_{TEAM};
      my $hasgun = $_{GUN};
      my $pteam = $team eq "(Unaffiliated)" ? 'u' : "\"$team\"";
      print "{\n";
      print "  name: \"$heroname\",\n";
      print "  team: \"$team\",\n";
      for (0..3) {
        my $count = (5, 5, 3, 1)[$_];
        my $pname = qw(c1 c2 uc ra)[$_];
        $_ = $subitems[$_];
        my @divided = split m/(?=#DIVIDED)/g;
        my @transformed = split m/(?=#TRANSFORMED\n)/g;
        my $hero = "";
        if (@transformed > 1) {
          my @heros = map{makehero($heroname, $pteam)}@transformed;
          $hero = "makeTransformingHeroCard(\n    $heros[0],\n    $heros[1],\n  )"
        } elsif (@divided > 1) {
          my @heros = map{makehero($heroname, $pteam)}"$divided[0,1]", "$divided[0,2]";
          $hero = "makeDividedHeroCard(\n    $heros[0],\n    $heros[1],\n  )"
        } else {
          $hero = makehero($heroname, $pteam);
        }
        print "  $pname: $hero,\n";
      }
      print "},\n";
    } elsif ($type eq "MASTERMINDS") {
      ($_, my @subitems) = split/^\n+/m;
      parse();
      my $mastermindname = $_{CARDNAME};
      $_ = shift @subitems and parse() unless $_{STRIKE};
      my $leads = $_{LEADS};
      my $vp = $_{VP};
      my $defense = $_{ATTACK} =~  s/[^0-9.]//gr;
      my $strike = $_{STRIKE};
      filterprint(qw(LEADS STRIKE VP ATTACK CARDNAME));
      $_ = shift @subitems and parse() if $subitems[0] =~ '#EPIC';
      my $epicstrike = $_{EPICNAME} && $_{STRIKE};
      my $make = $_{EPICNAME} ? "...makeEpic" : "make";
      if ($_{EPICNAME}) {
        filterprint(qw(LEADS STRIKE VP ATTACK));
        $vp ne $_{VP} and die "epic vp differ for $mastermindname";
        $leads ne $_{LEADS} and die "epic leads differ for $mastermindname";
        $mastermindname ne $_{EPICNAME} and $mastermindname ne "The $_{EPICNAME}" and print STDERR "$_{EPICNAME} epic name differ for $mastermindname\n";
        my $epicdefense = $_{ATTACK} =~  s/[^0-9.]//gr;
        $defense = "[ $defense, $epicdefense ]" if $epicdefense;
      }
      $_ = shift @subitems and parse() if $subitems[0] =~ '#TRANS';
      my $makeend = "";
      if ($_{TRANSNAME}) {
        filterprint(qw(STRIKE VP ATTACK));
        $vp ne $_{VP} and die "transformed vp differ for $mastermindname";
        $make = "makeTransformingMastermindCard(make";
        my $transdefense = $_{ATTACK} =~  s/[^0-9.]//gr;
        $makeend = "]), \"$_{TRANSNAME}\", $transdefense, ev => {\n// $_{STRIKE}\n";
      }
      print "${make}MastermindCard(\"$mastermindname\", $defense, $vp, \"$leads\", ev => {\n";
      print "// $strike\n";
      print "// $epicstrike\n" if $epicstrike;
      print "}, [\n";
      for (@subitems) {
        parse();
        filterprint(qw(TACTIC FIGHT));
        print "  [ \"$_{TACTIC}\", ev => {\n";
        print "  // $_{FIGHT}\n";
        print "  } ],\n";
      }
      print $makeend;
      print "]),\n";
    } elsif ($type eq "VILLAINS") {
      ($_, my @subitems) = split/^\n+/m;
      parse();
      my $groupname = $_{CARDNAME};
      my $copies = 0;
      print "{ name: \"$groupname\", cards: [\n";
      for (@subitems) {
        parse();
        $copies += $_{COPIES};
        if ($_{TRAPEFFECT}) { maketrap($groupname); next; }
        my ($gs, $ge) = gainable();
        filterprint(qw(SUBNAME COPIES));
        my $vp = $_{VP} =~ s/[^0-9.]//gr || 'u';
        my $defense = $_{ATTACK} =~ s/[^0-9]//gr;
        print "  [ $_{COPIES}, ${gs}makeVillainCard(\"$groupname\", \"$_{SUBNAME}\", $defense, $vp, {\n";
        print "    ambush: ev => {},\n" if $_{AMBUSH};
        print "    fight: ev => {},\n" if $_{FIGHT};
        print "    escape: ev => {},\n" if $_{ESCAPE};
        print "  })$ge],\n";
      }
      print "]},\n";
      $copies == 8 or die "Group $groupname has $copies";
    } elsif ($type eq "SCHEMES") {
      sub cond {
        my $n = "ev.nr";
        my $c = shift;
        return "$n <= $1" if $c =~ /^1-(\d+)$/;
        return "$n >= $1 && $n <= $2" if $c =~ /^(\d+)-(\d+)$/;
        join ' || ',map"$n === $_",split(/,\s*(?:and )?/,$c)
      }
      parse();
      filterprint(qw(CARDNAME TWIST TWISTNR TWISTELSE));
      $_{SETUP} =~ /^(\d+) Twists(\.|$)/;
      my $ntwists = $1 || 8;
      print "makeSchemeCard(\"$_{CARDNAME}\", { twists: $ntwists }, ev => {\n";
      print "  // Twist: $_{TWIST}\n" if $_{TWIST};
      my $first = 1;
      for (split/\|/,$_{TWISTNR}) {
        /NR\[(.*?)\] (.*)/;
        my $iselse = $first ? "  " : " else ";
        my $c = cond($1);
        print "${iselse}if ($c) {\n";
        print "    // Twist $1 $2\n";
        print "  }";
        $first = 0;
      }
      if ($_{TWISTELSE}) {
        print "else {\n";
        print "    // $_{TWISTELSE}\n";
        print "  }\n";
      } elsif (!$first) {
        print "\n";
      }
      print "}),\n";
    } elsif ($type eq "AMBITIONS") {
      parse();
      filterprint(qw(CARDNAME ATTACK));
      print "makeAmbitionCard(\"$_{CARDNAME}\", $_{ATTACK}, ev => {/* TODO */}),\n";
    } elsif ($type eq "WOUNDS") {
      parse();
      filterprint(qw(CARDNAME COPIES));
      print "[ $_{COPIES}, makeWoundCard(\"$_{CARDNAME}\", () => true, ev => {/* TODO */}) ],\n";
    } elsif ($type eq "HORRORS") {
      parse();
      filterprint(qw(CARDNAME));
      print "makeHorrorCard(\"$_{CARDNAME}\", ev => {/* TODO */}),\n";
    }
  }
  print "]}\n" if $henchmenGroup;
  print "]);\n";
