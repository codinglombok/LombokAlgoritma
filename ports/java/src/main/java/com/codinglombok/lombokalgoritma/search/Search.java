// LombokAlgoritma — Java Search Module — Apache-2.0 — @codinglombok
package com.codinglombok.lombokalgoritma.search;
public final class Search {
  private Search(){}
  public static int binarySearch(int[]a,int t){int lo=0,hi=a.length-1;while(lo<=hi){int m=(lo+hi)>>>1;if(a[m]==t)return m;else if(a[m]<t)lo=m+1;else hi=m-1;}return -1;}
  public static int lowerBound(int[]a,int t){int lo=0,hi=a.length;while(lo<hi){int m=(lo+hi)>>>1;if(a[m]<t)lo=m+1;else hi=m;}return lo;}
  public static int upperBound(int[]a,int t){int lo=0,hi=a.length;while(lo<hi){int m=(lo+hi)>>>1;if(a[m]<=t)lo=m+1;else hi=m;}return lo;}
}
