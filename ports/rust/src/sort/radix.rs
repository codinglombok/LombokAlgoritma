pub fn radix_sort_lsd(a:&mut[u32]){
    if a.len()<=1{return;}
    let mut t=a.to_vec();
    for sh in(0..32u32).step_by(8){
        let mut cnt=[0usize;256];
        for &v in a.iter(){cnt[((v>>sh)&0xFF)as usize]+=1;}
        for i in 1..256{cnt[i]+=cnt[i-1];}
        for &v in a.iter().rev(){let idx=((v>>sh)&0xFF)as usize;cnt[idx]-=1;t[cnt[idx]]=v;}
        a.clone_from_slice(&t);
    }
}
