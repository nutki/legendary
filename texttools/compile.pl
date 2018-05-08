#!/usr/bin/perl
%input = (
  HENCHMEN => "Henchmen_and_Backup_Adversaries.txt",
  HEROES => "Heroes_and_Allies.txt",
  VILLAINS => "Villains_and_Adversaries.txt",
  BYSTANDERS => "Bystanders.txt",
  MASTERMINDS => "Masterminds_and_Commanders.txt",
  SCHEMES => "Schemes_and_Plots.txt",
);
my ($type, @exp) = @ARGV;
my $file = $input{$type};
$exp{$_}=1 for @exp;
open A, $file;
undef $/;
$_ = <A>;
close A;
#print length,"\n";
sub autopower {
  my %num = (a => 1, another => 1, two => 2, three => 3);
  my %filt = (card => 'undefined', Wound => 'isWound');
  my @a = split"\n",shift;
  my @r = ();
  for (@a) {
    /^#|^$/ and next;
    my $effect = undef;
    my $cond = undef;
    my $wrap = undef;
    s/^{POWER (.*)} *// and $cond = "if (superPower(".(join' | ',map{"Color.".uc}split" ",$1)."))";
    s/^{TEAMPOWER (.*)} *// and $cond = "if (superPower(\"$1\"))";
    s/^<b>Spectrum<.b>: *// and $cond = "if (spectrumPower())";

    s/^You may KO a (card|Wound) from your hand or discard pile\. If you do, (.)/uc$2/e and $wrap = "KOHandOrDiscardEv(ev, $filt{$1}, ev => XXX)";

    /^You may KO a (card|Wound) from your hand or discard pile\.?/ and $effect = "KOHandOrDiscardEv(ev, $filt{$1})";
    /^Draw (a|another|two|three) cards?\.?$/ and $effect = "drawEv(ev, $num{$1})";
    /^[Yy]ou get \+(\d+) (Attack|Recruit)\.?$/ and $effect = "add$2Event(ev, $1)";
    /^Rescue a Bystander\.?$/ and $effect = "rescueEv(ev)";

    $effect = $wrap =~ s/XXX/$effect/r if $wrap && $effect;
    $effect = "{ $cond $effect; }" if $cond && $effect;
    push @r, $effect if $effect;
    #print "$_\n" if !$effect;
  }
  my $all = join', ',map"ev => $_",@r;
  @r ? @r > 1 ? ", [ $all ]" : ", $all" : "";
}
while(/^#EXPANSION: (.*)\n(((?!#EXPANSION:).*\n)*)/mg) {
  #print "$1 ".length$2,"\n";
  $content = $2;
  $expansion = $1;
  next if @exp && !$exp{$1};
  #print length$content, "\n";
  $content =~ s/^\n+//;
  @items = map{s/\n+$/\n/r}split /^(?=#CARDNAME)/m, $content;
  #print join"====\n",@items;
  sub parse {
    %_ = ();
    /#(\w+): (.*)/ ? ($_{$1} = $_{$1} ? "$_{$1}|$2" : $2) : ($_{ABILITIES} .= $_) for split /\n/;
    s!^#?!// !mg;
  }
  sub filterprint {
    my $f = join'|',@_;
    print s!^// ($f):.*\n!!mgr;
  }
  sub checkimage {
    my $dir = shift @_;
    my $name = join' ',@_;
    $imagename = $dir."/".((lc$name) =~ y/ /_/r =~ s/[^_a-z0-9]//gr).".png";
    print STDERR "no image: $imagename\n" unless -f "../images/$imagename";
  }
  print "addTemplates(\"$type\", \"$expansion\", [\n";
  for (@items) {
    if ($type eq "HENCHMEN") {
      parse();
      my $attack = $_{ATTACK} =~ s/[^0-9]//gr;
      filterprint(qw(CARDNAME VP));
      print "makeHenchenCard(\"$_{CARDNAME}\", $attack, {\n";
      print "  fight: ev => { },\n" if $_{FIGHT};
      print "  ambush: ev => { },\n" if $_{AMBUSH};
      print "}),\n";
      $_{VP} == 1 || $_{FIGHT} eq "Gain this as a Hero." or die "VP is not 1: $_{VP}";
      checkimage("henchmen", $_{CARDNAME});
    } elsif ($type eq "BYSTANDERS") {
      parse();
      filterprint(qw(CARDNAME VP COPIES));
      $copies = $_{COPIES} * 1 || 1;
      print "{ copies: $copies, card: makeBystanderCard(\"$_{CARDNAME}\"";
      print ", ev => {}" if $_{RESCUE};
      print ") },\n";
      $_{VP} == 1 || !defined($_{VP}) or die "VP is not 1: $_{VP}";
      checkimage($_{RESCUE} ? "bystanders" : "", $_{CARDNAME});
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
        my $autopower = autopower($_);
        parse();
        $_{COPIES} == $count or die "Bad number of copies for $pname: $_{COPIES}";
        filterprint(qw(SUBNAME COPIES CLASS));
        my $attack = $_{ATTACK} =~ s! ?1/2!.5!gr =~ s/[^0-9.]//gr;
        my $recruit = $_{RECRUIT} =~ s! ?1/2!.5!gr =~ s/[^0-9.]//gr;
        my $cost = $_{COST} =~ s/[^0-9]//gr;
        my $class = $_{CLASS} =~ s/\[(.*)\]/uc$1/er;
        $attack = 'u' if $attack eq '';
        $recruit = 'u' if $recruit eq '';
        my $flags = '';
        # Deadpool flags
        $flags .= 'G' if $hasgun || $_{GUN};
        $flags .= 'F' if $_{FLAVOR};
        $flags .= 'D' if /2/ || $heroname =~ /2/;
        print "  $pname: makeHeroCard(\"$heroname\", \"$_{SUBNAME}\", $cost, $recruit, $attack, Color.$class, $pteam, \"$flags\"$autopower),\n";
        checkimage("heroes", $heroname, $_{SUBNAME});
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
      filterprint(qw(LEADS STRIKE VP ATTACK CARDNAME));
      print "makeMastermindCard(\"$mastermindname\", $defense, $vp, \"$leads\", ev => {\n";
      print "// $_{STRIKE}\n";
      print "}, [\n";
      checkimage("masterminds", $mastermindname);
      for (@subitems) {
        parse();
        filterprint(qw(TACTIC FIGHT));
        print "  [ \"$_{TACTIC}\", ev => {\n";
        print "  // $_{FIGHT}\n";
        print "  } ],\n";
        checkimage("masterminds", $mastermindname, $_{TACTIC});
      }
      print "]),\n";
    } elsif ($type eq "VILLAINS") {
      ($_, my @subitems) = split/^\n+/m;
      parse();
      my $groupname = $_{CARDNAME};
      my $copies = 0;
      print "{ name: \"$groupname\", cards: [\n";
      for (0..3) {
        $_ = $subitems[$_];
        parse();
        filterprint(qw(SUBNAME COPIES));
        my $vp = $_{VP} =~ s/[^0-9.]//gr;
        my $defense = $_{ATTACK} =~ s/[^0-9]//gr;
        $copies += $_{COPIES};
        print "  [ $_{COPIES}, makeVillainCard(\"$groupname\", \"$_{SUBNAME}\", $defense, $vp), {\n";
        print "    ambush: ev => {},\n" if $_{AMBUSH};
        print "    fight: ev => {},\n" if $_{FIGHT};
        print "    escape: ev => {},\n" if $_{ESCAPE};
        print "  }],\n";
        checkimage("villains", $groupname, $_{SUBNAME});
      }
      print "]},\n";
      $copies == 8 or die "Group $groupname has $copies";
    } elsif ($type eq "SCHEMES") {
      sub cond {
        my $n = "ev.nr";
        my $c = shift;
        return "$n <= $1" if $c =~ /^1-(\d+)$/;
        return "$n >= $1 && $n <= $2" if $c =~ /^(\d+)-(\d+)$/;
        join ' || ',map"$n == $_",split(/,\s*(?:and )?/,$c)
      }
      parse();
      filterprint(qw(CARDNAME EVILWINS TWIST TWISTNR TWISTELSE));
      $_{SETUP} =~ /^(\d+) Twists(\.|$)/;
      my $ntwists = $1 || 8;
      print "makeSchemeCard(\"$_{CARDNAME}\", { twists: $ntwists }, ev => {\n";
      print "  // Twist: $_{TWIST}\n" if $_{TWIST};
      my $first = 1;
      for (split/\|/,$_{TWISTNR}) {
        /NR\[(\d+)\] (.*)/;
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
    }
  }
  print "]);\n";
}
