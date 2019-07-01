#!/usr/bin/perl
use Time::HiRes qw(usleep nanosleep);
use File::Copy;
use File::Basename qw/dirname/;

sub mkdir_recursive {
    my $path = shift;
    mkdir_recursive(dirname($path)) if not -d dirname($path);
    mkdir $path or die "Could not make dir $path: $!" if not -d $path;
    return;
}

sub mkdir_and_copy {
    my ($from, $to) = @_;
    mkdir_recursive(dirname($to));
    return move($from, $to);
}


%input = (
  HENCHMEN => "Henchmen_and_Backup_Adversaries.txt",
  HEROES => "Heroes_and_Allies.txt",
  VILLAINS => "Villains_and_Adversaries.txt",
  BYSTANDERS => "Bystanders.txt",
  MASTERMINDS => "Masterminds_and_Commanders.txt",
  SCHEMES => "Schemes_and_Plots.txt",
);
my ($exp, $tmpDir) = @ARGV;
for $type (sort {$a cmp $b} keys %input) {
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
    my $name = join' ',@_;
    $imagename = $dir."/".((lc$name) =~ y/ /_/r =~ s/[^_a-z0-9]//gr).".jpg";
    $imagename = "$exp/$imagename" if $exp ne 'Legendary';
    print "no image: $imagename\n" unless -f "../images/$imagename";
    return if -f "../images/$imagename";
    do {
    my @f = ();
    opendir DIR, $tmpDir;
    while($f = readdir DIR) { $f=~/\.jpg$/ and push @f, $f }
    closedir DIR;
    $| = 1;
    printf "waiting\r";;
    usleep 500000;
    if (@f == 1) {
      if (mkdir_and_copy("$tmpDir/$f[0]", "../images/$imagename")) {
        print "OK\n";
        return;
      };
    }
    } while (1);
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
        checkimage("masterminds", $mastermindname, $_{TACTIC});
      }
    } elsif ($type eq "VILLAINS") {
      ($_, my @subitems) = split/^\n+/m;
      parse();
      my $groupname = $_{CARDNAME};
      for (@subitems) {
        parse();
        checkimage("villains", $groupname, $_{SUBNAME});
      }
    } elsif ($type eq "SCHEMES") {
      parse();
      checkimage("schemes", $_{CARDNAME});
    }
  }
}