#!/usr/bin/perl -l
@exps = split "\n", <<END;
00 Legendary
01 Dark City
02 Fantastic Four
03 Paint the Town Red
04 Villains
05 Guardians of the Galaxy
06 Fear Itself
07 Secret Wars Volume 1
08 Secret Wars Volume 2
09 Captain America 75th Anniversary
10 Civil War
-- 3D
11 Deadpool
12 Noir
13 X-Men
14 Spider-Man Homecoming
15 Champions
16 World War Hulk
-- Marvel Studios Phase 1
17 Ant-Man
18 Venom
19 Dimensions
20 S.H.I.E.L.D.
21 Heroes of Asgard
22 New Mutants
23 Into the Cosmos
END
%n = (
'h' => 'Heroes_and_Allies',
'v' => 'Villains_and_Adversaries',
'm' => 'Masterminds_and_Commanders',
'hm' => 'Henchmen_and_Backup_Adversaries',
's' => 'Schemes_and_Plots',
'b' => 'Bystanders'
);

print " HE   V   M   H   S   B";
for(@exps) {
 $e = substr($_,3);
 for $c (qw(h v m hm s b)) {
  open A, "$e/$n{$c}.txt";
  while (<A>) {
   $total{$c}++, ${$c}{$e}++ if /^#CARDNAME/;
  }
  close A;
 }
 printf "%3d %3d %3d %3d %3d %3d $e\n", $h{$e}, $v{$e}, $m{$e}, $hm{$e}, $s{$e}, $b{$e};
}
printf "%3d %3d %3d %3d %3d %3d $_\n", $total{'h'}, $total{'v'}, $total{'m'}, $total{'hm'}, $total{'s'}, $total{'b'};
