namespace WorkflowSystem.Application.Common.Utils;

public static class InputSanitizer
{
    public static string Sanitize(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return string.Empty;
        var sanitized = input.Trim()
            .Replace("<", "")
            .Replace(">", "");
        sanitized = new string(sanitized.Where(c => !char.IsControl(c)).ToArray());
        return sanitized;
    }
} 