using FriendBusiness.Api.Models;
//using MySqlConnector;
using Microsoft.Data.SqlClient;
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


//var connectionString = builder.Configuration.GetConnectionString("MySqlConnection");
var connectionString = builder.Configuration.GetConnectionString("SqlServerConnection");

/*builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString)
    ));*/

builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlServer(connectionString));


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
    //var connectionString = configuration.GetConnectionString("MySqlConnection");
    var connectionString = configuration.GetConnectionString("SqlServerConnection");

    if (string.IsNullOrWhiteSpace(connectionString))
    {
        return Results.Problem("The SQL Server connection string is missing.");
    }

    //await using var connection = new MySqlConnection(connectionString);
    await using var connection = new SqlConnection(connectionString);

    await connection.OpenAsync();

    const string sql = """
        SELECT id, message
        FROM test_messages
        ORDER BY id;
        """;

    //await using var command = new MySqlCommand(sql, connection);
    await using var command = new SqlCommand(sql, connection);

    await using var reader = await command.ExecuteReaderAsync();

    if (!await reader.ReadAsync())
    {
        return Results.NotFound("No test message was found in SQL Server.");
    }

    var testMessage = new TestMessage
    {
        Id = reader.GetInt32(reader.GetOrdinal("id")),
        Message = reader.GetString(reader.GetOrdinal("message"))
    };

    return Results.Ok(testMessage);
});

app.Run();