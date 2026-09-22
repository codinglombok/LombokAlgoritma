// LombokAlgoritma — C# ML/Vector Operations
// DIPAKAI oleh LombokVector (C# port)
// Apache-2.0 — @codinglombok
using System;

namespace CodingLombok.LombokAlgoritma.ML;

public static class VectorOps
{
    public static double DotProduct(double[] a, double[] b)
    {
        var sum = 0.0;
        for (var i = 0; i < a.Length; i++) sum += a[i] * b[i];
        return sum;
    }

    public static double L2Norm(double[] v)
    {
        var sum = 0.0;
        foreach (var x in v) sum += x * x;
        return Math.Sqrt(sum);
    }

    public static double CosineSimilarity(double[] a, double[] b)
    {
        var na = L2Norm(a); var nb = L2Norm(b);
        return na == 0 || nb == 0 ? 0.0 : DotProduct(a, b) / (na * nb);
    }

    public static double L2Distance(double[] a, double[] b)
    {
        var sum = 0.0;
        for (var i = 0; i < a.Length; i++) { var d = a[i] - b[i]; sum += d * d; }
        return Math.Sqrt(sum);
    }

    public static double[] Normalize(double[] v)
    {
        var n = L2Norm(v);
        if (n == 0) return new double[v.Length];
        var out_ = new double[v.Length];
        for (var i = 0; i < v.Length; i++) out_[i] = v[i] / n;
        return out_;
    }
}
