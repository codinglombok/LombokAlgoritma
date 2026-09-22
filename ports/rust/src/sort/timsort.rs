const MIN_MERGE: usize = 32;
fn min_run(mut n: usize) -> usize { let mut r=0; while n>=MIN_MERGE{r|=n&1;n>>=1;} n+r }
fn insertion_sort_by<T,F:Fn(&T,&T)->core::cmp::Ordering>(a:&mut[T],c:&F){
    for i in 1..a.len(){let mut j=i;while j>0&&c(&a[j],&a[j-1])==core::cmp::Ordering::Less{a.swap(j,j-1);j-=1;}}
}
pub fn timsort<T:Ord+Clone>(a:&mut[T]){timsort_by(a,|x,y|x.cmp(y));}
pub fn timsort_by<T:Clone,F:Fn(&T,&T)->core::cmp::Ordering>(a:&mut[T],c:F){
    let n=a.len();if n<=1{return;}
    let mr=min_run(n);
    let mut i=0;while i<n{let e=(i+mr).min(n);insertion_sort_by(&mut a[i..e],&c);i+=mr;}
    let mut sz=mr;
    while sz<n{
        let mut lo=0;while lo<n{
            let mid=(lo+sz).min(n);let hi=(lo+2*sz).min(n);
            if mid<hi{
                let l:Vec<T>=a[lo..mid].to_vec();let r:Vec<T>=a[mid..hi].to_vec();
                let(mut p,mut q,mut k)=(0,0,lo);
                while p<l.len()&&q<r.len(){if c(&l[p],&r[q])!=core::cmp::Ordering::Greater{a[k]=l[p].clone();p+=1;}else{a[k]=r[q].clone();q+=1;}k+=1;}
                while p<l.len(){a[k]=l[p].clone();p+=1;k+=1;}
                while q<r.len(){a[k]=r[q].clone();q+=1;k+=1;}
            }
            lo+=2*sz;
        }
        sz*=2;
    }
}
