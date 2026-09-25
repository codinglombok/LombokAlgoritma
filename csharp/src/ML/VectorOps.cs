// LombokAlgoritma — C# ML/Vector Operations
// DIPAKAI oleh LombokVector (C# port)
// Apache-2.0 — @codinglombok
using System;

namespace CodingLombok.LombokAlgoritma.ML;

/// <summary>Vector similarity and distance functions (SPEC §13.1).</summary>
public static class VectorOps
{
    /// <summary>Dot product Σ aᵢ·bᵢ (summed left to right).</summary>
    public static double DotProduct(double[] a, double[] b)
    {
        var sum = 0.0;
        for (var i = 0; i < a.Length; i++) sum += a[i] * b[i];
        return sum;
    }

    /// <summary>Euclidean norm √Σ vᵢ².</summary>
    public static double L2Norm(double[] v)
    {
        var sum = 0.0;
        foreach (var x in v) sum += x * x;
        return Math.Sqrt(sum);
    }

    /// <summary>Cosine similarity dot(a,b)/(‖a‖·‖b‖); 0 when either vector is zero.</summary>
    public static double CosineSimilarity(double[] a, double[] b)
    {
        var na = L2Norm(a); var nb = L2Norm(b);
        return na == 0 || nb == 0 ? 0.0 : DotProduct(a, b) / (na * nb);
    }

    /// <summary>Euclidean distance √Σ(aᵢ−bᵢ)².</summary>
    public static double L2Distance(double[] a, double[] b)
    {
        var sum = 0.0;
        for (var i = 0; i < a.Length; i++) { var d = a[i] - b[i]; sum += d * d; }
        return Math.Sqrt(sum);
    }

    /// <summary>Unit vector v/‖v‖ (zero vector stays zero).</summary>
    public static double[] Normalize(double[] v)
    {
        var n = L2Norm(v);
        if (n == 0) return new double[v.Length];
        var out_ = new double[v.Length];
        for (var i = 0; i < v.Length; i++) out_[i] = v[i] / n;
        return out_;
    }
}
