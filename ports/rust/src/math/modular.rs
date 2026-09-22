pub fn mod_pow(mut base:u64,mut exp:u64,m:u64)->u64{
    if m==1{return 0;}let mut result=1u64;base%=m;
    while exp>0{if exp&1==1{result=result.wrapping_mul(base)%m;}exp>>=1;base=base.wrapping_mul(base)%m;}
    result
}
