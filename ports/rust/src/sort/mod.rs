mod timsort; mod quicksort; mod mergesort; mod heapsort; mod radix;
pub use timsort::{timsort, timsort_by};
pub use quicksort::quicksort;
pub use mergesort::mergesort;
pub use heapsort::heapsort;
pub use radix::radix_sort_lsd;
pub fn sort<T: Ord + Clone>(arr: &mut [T]) { timsort(arr); }
