#!/usr/bin/perl
%input = (
  HENCHMEN => "Henchmen_and_Backup_Adversaries.txt",
  HEROES => "Heroes_and_Allies.txt",
  VILLAINS => "Villains_and_Adversaries.txt",
  BYSTANDERS => "Bystanders.txt",
  MASTERMINDS => "Masterminds_and_Commanders.txt",
  SCHEMES => "Schemes_and_Plots.txt",
  SIDEKICKS => "Sidekicks_and_New_Recruits.txt",
);
@inputkeys = qw(HEROES MASTERMINDS VILLAINS HENCHMEN SCHEMES BYSTANDERS SIDEKICKS);
my ($exp) = @ARGV;
for $type (@inputkeys) {
  my $file = $input{$type};
  open A, "<$exp/$file";
  undef $/;
  $_ = <A>;
  close A;
  #print length,"\n";
  $content = $_;
  #print length$content, "\n";
  $content =~ s/^\n+//;
  @items = map{s/\n+$/\n/r}split /^(?=#CARDNAME)/m, $content;
  #print join"====\n",@items;
  sub parse {
    %_ = ();
    /#(\w+): (.*)/ ? ($_{$1} = $_{$1} ? "$_{$1}|$2" : $2) : ($_{ABILITIES} .= $_) for split /\n/;
    s!^#?!// !mg;
  }
  sub checkimage {
    my $dir = shift @_;
    my $name = join' ',grep$_,@_;
    print "[\"$dir\",\"$name\"],\n";
    $imagename = $dir."/".((lc$name) =~ y/ /_/r =~ s/[^_a-z0-9]//gr).".jpg";
    $imagename = "$exp/$imagename" if $exp ne 'Legendary';
#    print "'$imagename',\n";
#    print STDERR "no image: $imagename\n" unless -f "../images/$imagename";
  }
  for (@items) {
    if ($type eq "HENCHMEN") {
      parse();
      my $attack = $_{ATTACK} =~ s/[^0-9]//gr;
      checkimage("henchmen", $_{CARDNAME});
    } elsif ($type eq "BYSTANDERS") {
      parse();
      checkimage($_{RESCUE} ? "bystanders" : "", $_{CARDNAME});
    } elsif ($type eq "HEROES") {
      ($_, my @subitems) = split/^\n+/m;
      parse();
      my $heroname = $_{CARDNAME};
      for (@subitems) {
        parse();
        checkimage("heroes", $heroname, $_{SUBNAME});
      }
    } elsif ($type eq "MASTERMINDS") {
      ($_, my @subitems) = split/^\n+/m;
      parse();
      my $mastermindname = $_{CARDNAME};
      $_ = shift @subitems and parse() unless $_{STRIKE};
      checkimage("masterminds", $mastermindname);
      for (@subitems) {
        parse();
        checkimage("masterminds", "Epic $mastermindname") if $_{EPICNAME};
        checkimage("masterminds", $mastermindname, $_{TACTIC}) if $_{TACTIC};
      }
    } elsif ($type eq "VILLAINS") {
      ($_, my @subitems) = split/^\n+/m;
      parse();
      my $groupname = $_{CARDNAME};
      for (@subitems) {
        parse();
        checkimage("villains", $groupname, $_{SUBNAME}, $_{VARIANT});
      }
    } elsif ($type eq "SCHEMES") {
      parse();
      checkimage("schemes", $_{CARDNAME});
    } elsif ($type eq "SIDEKICKS") {
      parse();
      checkimage("sidekicks", $_{CARDNAME});
    }
  }
}