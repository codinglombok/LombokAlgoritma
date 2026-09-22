pub fn quicksort<T:Ord>(a:&mut[T]){
    if a.len()<=16{for i in 1..a.len(){let mut j=i;while j>0&&a[j]<a[j-1]{a.swap(j,j-1);j-=1;}}return;}
    let p=partition(a);let(l,r)=a.split_at_mut(p);quicksort(l);quicksort(&mut r[1..]);
}
fn partition<T:Ord>(a:&mut[T])->usize{
    let hi=a.len()-1;let mid=hi/2;
    if a[0]>a[mid]{a.swap(0,mid);}if a[0]>a[hi]{a.swap(0,hi);}if a[mid]>a[hi]{a.swap(mid,hi);}
    a.swap(mid,hi);let mut i=0;for j in 0..hi{if a[j]<=a[hi]{a.swap(i,j);i+=1;}}a.swap(i,hi);i
}
