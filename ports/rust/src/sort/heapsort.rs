pub fn heapsort<T:Ord>(a:&mut[T]){
    let n=a.len();if n<=1{return;}
    for i in(0..n/2).rev(){sift(a,i,n);}
    for e in(1..n).rev(){a.swap(0,e);sift(a,0,e);}
}
fn sift<T:Ord>(a:&mut[T],mut r:usize,e:usize){
    loop{let mut lg=r;let l=2*r+1;let ri=2*r+2;
        if l<e&&a[l]>a[lg]{lg=l;}if ri<e&&a[ri]>a[lg]{lg=ri;}
        if lg==r{break;}a.swap(r,lg);r=lg;
    }
}
