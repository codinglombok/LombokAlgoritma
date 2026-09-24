//! Searching sorted and unsorted slices.
use core::cmp::Ordering;

/// Index of `target` in the ascending slice `arr`, if present.
pub fn binary_search<T: Ord>(arr: &[T], target: &T) -> Option<usize> {
    let (mut lo, mut hi) = (0, arr.len());
    while lo < hi {
        let mid = lo + (hi - lo) / 2;
        match arr[mid].cmp(target) {
            Ordering::Equal => return Some(mid),
            Ordering::Less => lo = mid + 1,
            Ordering::Greater => hi = mid,
        }
    }
    None
}

/// First index `i` with `arr[i] >= target` (or `arr.len()`).
pub fn lower_bound<T: Ord>(arr: &[T], target: &T) -> usize {
    let (mut lo, mut hi) = (0, arr.len());
    while lo < hi {
        let mid = lo + (hi - lo) / 2;
        if arr[mid] < *target {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    lo
}

/// First index `i` with `arr[i] > target` (or `arr.len()`).
pub fn upper_bound<T: Ord>(arr: &[T], target: &T) -> usize {
    let (mut lo, mut hi) = (0, arr.len());
    while lo < hi {
        let mid = lo + (hi - lo) / 2;
        if arr[mid] <= *target {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    lo
}

/// First index of `target` in `arr`, if present.
pub fn linear_search<T: PartialEq>(arr: &[T], target: &T) -> Option<usize> {
    arr.iter().position(|x| x == target)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn searches() {
        let a = [1, 3, 3, 5, 7];
        assert_eq!(binary_search(&a, &5), Some(3));
        assert_eq!(binary_search(&a, &4), None);
        assert_eq!(binary_search::<i32>(&[], &1), None);
        assert_eq!(lower_bound(&a, &3), 1);
        assert_eq!(upper_bound(&a, &3), 3);
        assert_eq!(lower_bound(&a, &9), 5);
        assert_eq!(linear_search(&a, &7), Some(4));
    }
}
