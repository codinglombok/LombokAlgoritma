use ExtUtils::MakeMaker;
WriteMakefile(
    NAME         => 'LombokAlgoritma',
    VERSION_FROM => 'lib/LombokAlgoritma/Sort.pm',
    AUTHOR       => 'codinglombok <codinglombok@gmail.com>',
    LICENSE      => 'apache',
    MIN_PERL_VERSION => '5.036',
    PREREQ_PM    => { 'Digest::SHA' => 0 },
    TEST_REQUIRES => { 'Test::More' => 0 },
);
