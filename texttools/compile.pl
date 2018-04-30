#!/usr/bin/perl
%input = (
  HENCHMEN => "Henchmen_and_Backup_Adversaries.txt",
  HEROES => "Heroes_and_Allies.txt",
);
my ($type, @exp) = @ARGV;
my $file = $input{$type};
$exp{$_}=1 for @exp;
open A, $file;
undef $/;
$_ = <A>;
close A;
#print length,"\n";
while(/^#EXPANSION: (.*)\n(((?!#EXPANSION:).*\n)*)/mg) {
  #print "$1 ".length$2,"\n";
  $content = $2;
  next if @exp && !$exp{$1};
  #print length$content, "\n";
  $content =~ s/^\n+//;
  @items = map{s/\n+$/\n/r}split /^(?=#CARDNAME)/m, $content;
  #print join"====\n",@items;
  sub parse {
    %_ = ();
    /#(\w+): (.*)/ ? ($_{$1} = $2) : ($_{ABILITIES} .= $_) for split /\n/;
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
        print "  $pname: makeHeroCard(\"$heroname\", \"$_{SUBNAME}\", $cost, $recruit, $attack, Color.$class, $pteam, \"$flags\"),\n";
        checkimage("heroes", $heroname, $_{SUBNAME});
      }
      print "},\n";
    }
  }
}
