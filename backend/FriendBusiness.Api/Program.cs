using FriendBusiness.Api.Models;
using MySqlConnector;
using FriendBusiness.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

const string ReactCorsPolicy = "ReactFrontend";

//builder.Services.AddControllers();
//builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy(ReactCorsPolicy, policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});


var connectionString = builder.Configuration.GetConnectionString("MySqlConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString)
    ));


builder.Services.AddControllers();

var app = builder.Build();

/*if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}*/

app.UseHttpsRedirection();

app.UseCors(ReactCorsPolicy);

app.MapControllers();

app.MapGet("/api/test-database", async (
    IConfiguration configuration) =>
{
    var connectionString = configuration.GetConnectionString("MySqlConnection");

    if (string.IsNullOrWhiteSpace(connectionString))
    {
        return Results.Problem("The MySQL connection string is missing.");
    }

    await using var connection = new MySqlConnection(connectionString);

    await connection.OpenAsync();

    const string sql = """
        SELECT id, message
        FROM test_messages
        ORDER BY id
        LIMIT 1;
        """;

    await using var command = new MySqlCommand(sql, connection);

    await using var reader = await command.ExecuteReaderAsync();

    if (!await reader.ReadAsync())
    {
        return Results.NotFound("No test message was found in MySQL.");
    }

    var testMessage = new TestMessage
    {
        Id = reader.GetInt32("id"),
        Message = reader.GetString("message")
    };

    return Results.Ok(testMessage);
});

app.Run();