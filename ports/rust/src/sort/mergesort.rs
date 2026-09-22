pub fn mergesort<T:Ord+Clone>(a:&mut[T]){
    let n=a.len();if n<=1{return;}
    let mut t=a.to_vec();let mut w=1;
    while w<n{
        let mut lo=0;while lo<n{
            let mid=(lo+w).min(n);let hi=(lo+2*w).min(n);
            let(mut i,mut j,mut k)=(lo,mid,lo);
            while i<mid&&j<hi{if a[i]<=a[j]{t[k]=a[i].clone();i+=1;}else{t[k]=a[j].clone();j+=1;}k+=1;}
            while i<mid{t[k]=a[i].clone();i+=1;k+=1;}
            while j<hi{t[k]=a[j].clone();j+=1;k+=1;}
            lo+=2*w;
        }
        a.clone_from_slice(&t);w*=2;
    }
}
