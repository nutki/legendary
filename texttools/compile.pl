#!/usr/bin/perl
%input = (
  HENCHMEN => "Henchmen_and_Backup_Adversaries.txt",
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
  $content .= $2 if $exp{$1} || !@exp;
}
#print length$content, "\n";
if ($type eq "HENCHMEN") {
  $content =~ s/^\n+//;
  @items = split /^\n+/m, $content;
}
#print join"====\n",@items;
sub parse {
  %_ = ();
  /#(\w+): (.*)/ ? ($_{$1} = $2) : ($_{ABILITIES} .= $_) for split /\n/;
}
if ($type eq "HENCHMEN") {
  for (@items) {
    parse();
    s!^#!// !mg;
    my $attack = $_{ATTACK} =~ s/[^0-9]//gr;
    print;
    print "makeHenchenCard(\"$_{CARDNAME}\", $attack, {\n";
    print "  fight: ev => { },\n" if $_{FIGHT};
    print "  ambush: ev => { },\n" if $_{AMBUSH};
    print "}),\n";
    $_{VP} == 1 || $_{FIGHT} eq "Gain this as a Hero." or die "VP is not 1: $_{VP}";
    $imagename = "henchmen/".((lc$_{CARDNAME}) =~ y/ /_/r =~ s/[^_a-z0-9]//gr).".png";
    print STDERR "no image: $imagename\n" unless -f "../images/$imagename";
  }
}
