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
my ($type) = @ARGV;
my @entries = ();
my @exps = grep { !/Phase 1/ } grep { -d } glob('*');
for $exp (@exps) {
my $file = $input{$type};
open A, "<$exp/$file";
undef $/;
$_ = <A>;
close A;
#print length,"\n";
sub countwords {
  my $s = shift;
  $s =~ s/DANGERSENSE/DANGER SENSE/gm;
  my @w = grep { !/^[^A-Za-z]+$|POWER|Tech|Instinct|Ranged|Covert|Strength/ } $s =~ /[\w'-.]+/g;
  # print STDERR "$#w @w\n";
  return scalar @w;
}
sub gainable {
  /GAINABLE/ or return ();
  my $name = join"",map{'"'.s/"/\\"/gr .'", '}@_;
  my $attack = $_{ATTACKG} =~ s! ?1/2!.5!gr =~ s/[^0-9.]//gr;
  my $recruit = $_{RECRUIT} =~ s! ?1/2!.5!gr =~ s/[^0-9.]//gr;
  $attack = 'u' if $attack eq '';
  $recruit = 'u' if $recruit eq '';
  my $flags = '';
  # Deadpool flags
  $flags .= 'G' if $_{GUN};
  $flags .= 'F' if $_{FLAVOR};
  $flags .= 'D' if /2/;
  $flags .= '4' if /4/;
  $flags .= 'R' if $_{RECRUIT} =~ /\+/;
  $flags .= 'A' if $_{ATTACKG} =~ /\+/;
  $flags .= 'N' if !/^[^#]/m;
  $flags .= 'T' if countwords(s/^#.*//gmr) >= 10;
  push @entries, "$name\"$flags\"";
}
sub makehero {
  my ($heroname, $pteam) = @_;
  parse();
  my $heroname2 = $_{DIVHERO} || $heroname;
  my $cardname = $_{DIVIDED} || $_{SUBNAME} || $_{CARDNAME};
  my $pteam2 = $_{DIVTEAM} ? $_{DIVTEAM} eq "(Unaffiliated)" ? 'u' : "\"$_{DIVTEAM}\"" : $pteam;
#  $_{COPIES} == $count or die "Bad number of copies for $pname: $_{COPIES}";
#  filterprint(qw(SUBNAME CLASS ATTACK RECRUIT COST FLAVOR CARDNAME TEAM));
  my $attack = $_{ATTACK} =~ s! ?1/2!.5!gr =~ s/[^0-9.]//gr;
  my $recruit = $_{RECRUIT} =~ s! ?1/2!.5!gr =~ s/[^0-9.]//gr;
  $attack = 'u' if $attack eq '';
  $recruit = 'u' if $recruit eq '';
  my $flags = '';
  # Deadpool flags
  $flags .= 'G' if $hasgun || $_{GUN};
  $flags .= 'F' if $_{FLAVOR};
  $flags .= 'D' if /2/ || $heroname =~ /2/;
  $flags .= '4' if /4/ || $heroname =~ /4/;
  $flags .= 'R' if $_{RECRUIT} =~ /\+/;
  $flags .= 'A' if $_{ATTACK} =~ /\+/;
  # SW1 Black Bolt flag (no rules text)
  $flags .= 'N' if !/^[^#]/m;
  $flags .= 'T' if countwords(s/^#.*//gmr) >= 10;
  return "\"$heroname2\", \"$cardname\", \"$flags\"";
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
      $hasgun = $_{GUN};
      my $pteam = $team eq "(Unaffiliated)" ? 'u' : "\"$team\"";
      for (0..$#subitems) {
        my $count = (5, 5, 3, 1)[$_];
        my $pname = ($#subitems == 3 ? qw(c1 c2 uc ra):qw(c1 c2 c3 uc u2 ra))[$_];
        $_ = $subitems[$_];
        my @divided = split m/(?=#DIVIDED)/g;
        my @transformed = split m/(?=#TRANSFORMED\n)/g;
        my $hero = "";
        if (@transformed > 1) {
          my @heros = map{makehero($heroname, $pteam)}@transformed;
          $hero = "$heros[0]],\n[$heros[1]";
          push @entries, $heros[0], $heros[1];
        } elsif (@divided > 1) {
          my @heros = map{makehero($heroname, $pteam)}"$divided[0,1]", "$divided[0,2]";
          $hero = "$heros[0]],\n[$heros[1]";
          push @entries, $heros[0], $heros[1];
        } else {
          $hero = makehero($heroname, $pteam);
          push @entries, $hero;
        }
      }
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
        $vp ne $_{VP} and print STDERR "epic vp differ for $mastermindname ($vp vs $_{VP})\n";
        $leads ne $_{LEADS} and print STDERR "epic leads differ for $mastermindname ($leads vs $_{LEADS})";
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
      for (@subitems) {
        parse();
        gainable($groupname, $_{SUBNAME});
      }
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
}
  print "[\n";
  print join",\n",map"[$_]",@entries;
  print "\n]\n";
