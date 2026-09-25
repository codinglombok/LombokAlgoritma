// LombokAlgoritma — Java Sort Module — Apache-2.0 — @codinglombok
package com.codinglombok.lombokalgoritma.sort;
import java.util.Arrays; import java.util.Comparator;
public final class Sort {
  private Sort(){}
  public static <T extends Comparable<T>> T[] timsort(T[] a){T[] r=Arrays.copyOf(a,a.length);Arrays.sort(r);return r;}
  public static <T> T[] timsort(T[] a,Comparator<T> c){T[] r=Arrays.copyOf(a,a.length);Arrays.sort(r,c);return r;}
  public static int[] mergesort(int[] arr){
    int[]a=arr.clone(),n=new int[]{a.length},tmp=new int[a.length];
    for(int w=1;w<n[0];w*=2){for(int lo=0;lo<n[0];lo+=2*w){int mid=Math.min(lo+w,n[0]),hi=Math.min(lo+2*w,n[0]),i=lo,j=mid,k=lo;
      while(i<mid&&j<hi){if(a[i]<=a[j])tmp[k++]=a[i++];else tmp[k++]=a[j++];}while(i<mid)tmp[k++]=a[i++];while(j<hi)tmp[k++]=a[j++];}
      System.arraycopy(tmp,0,a,0,n[0]);}return a;}
  public static int[] quicksort(int[] arr){int[]a=arr.clone();if(a.length>1)qs(a,0,a.length-1);return a;}
  private static void qs(int[]a,int lo,int hi){if(lo>=hi)return;if(hi-lo<16){is(a,lo,hi);return;}int p=part(a,lo,hi);qs(a,lo,p-1);qs(a,p+1,hi);}
  private static int part(int[]a,int lo,int hi){int mid=(lo+hi)/2;if(a[lo]>a[mid]){int t=a[lo];a[lo]=a[mid];a[mid]=t;}if(a[lo]>a[hi]){int t=a[lo];a[lo]=a[hi];a[hi]=t;}if(a[mid]>a[hi]){int t=a[mid];a[mid]=a[hi];a[hi]=t;}int p=a[hi],i=lo;for(int j=lo;j<hi;j++)if(a[j]<=p){int t=a[i];a[i]=a[j];a[j]=t;i++;}int t=a[i];a[i]=a[hi];a[hi]=t;return i;}
  private static void is(int[]a,int lo,int hi){for(int i=lo+1;i<=hi;i++){int k=a[i],j=i-1;while(j>=lo&&a[j]>k){a[j+1]=a[j];j--;}a[j+1]=k;}}
  public static int[] heapsort(int[] arr){int[]a=arr.clone();int n=a.length;for(int i=n/2-1;i>=0;i--)sft(a,i,n);for(int e=n-1;e>0;e--){int t=a[0];a[0]=a[e];a[e]=t;sft(a,0,e);}return a;}
  private static void sft(int[]a,int r,int e){while(true){int lg=r,l=2*r+1,ri=2*r+2;if(l<e&&a[l]>a[lg])lg=l;if(ri<e&&a[ri]>a[lg])lg=ri;if(lg==r)break;int t=a[r];a[r]=a[lg];a[lg]=t;r=lg;}}
  public static int[] countingSort(int[] arr){if(arr.length==0)return new int[0];int max=0;for(int v:arr)if(v>max)max=v;int[]cnt=new int[max+1];for(int v:arr)cnt[v]++;int[]out=new int[arr.length],k=new int[]{0};for(int i=0;i<=max;i++)for(int j=0;j<cnt[i];j++)out[k[0]++]=i;return out;}
}
