pub fn gcd(mut a:u64,mut b:u64)->u64{while b!=0{let t=b;b=a%b;a=t;}a}
pub fn lcm(a:u64,b:u64)->u64{if a==0||b==0{return 0;}a/gcd(a,b)*b}
pub fn mod_inverse(mut a:i64,m:i64)->Option<i64>{
    let(mut old_r,mut r)=(a,m);let(mut old_s,mut s)=(1i64,0i64);
    while r!=0{let q=old_r/r;(old_r,r)=(r,old_r-q*r);(old_s,s)=(s,old_s-q*s);}
    if old_r!=1{return None;}Some(((old_s%m)+m)%m)
}
