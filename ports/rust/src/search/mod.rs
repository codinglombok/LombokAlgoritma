pub fn binary_search<T:Ord>(arr:&[T],target:&T)->Option<usize>{
    let(mut lo,mut hi)=(0,arr.len());
    while lo<hi{let mid=lo+(hi-lo)/2;match arr[mid].cmp(target){core::cmp::Ordering::Equal=>return Some(mid),core::cmp::Ordering::Less=>lo=mid+1,core::cmp::Ordering::Greater=>hi=mid,}}
    None
}
pub fn lower_bound<T:Ord>(arr:&[T],target:&T)->usize{
    let(mut lo,mut hi)=(0,arr.len());
    while lo<hi{let mid=lo+(hi-lo)/2;if arr[mid]<*target{lo=mid+1;}else{hi=mid;}}lo
}
pub fn linear_search<T:PartialEq>(arr:&[T],target:&T)->Option<usize>{arr.iter().position(|x|x==target)}
