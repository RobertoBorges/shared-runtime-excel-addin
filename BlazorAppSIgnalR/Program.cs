using BlazorAppSIgnalR.Data;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddServerSideBlazor();
builder.Services.AddSingleton<WeatherForecastService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecific", builder =>
    {
        builder.WithOrigins("http://localhost:3001", "http://localhost:3000")
               .AllowAnyHeader()
               .AllowAnyMethod()
               .AllowCredentials();
    });
});

// 1. Add SignalR
builder.Services.AddSignalR();

// 2. Register the background broadcasting service
builder.Services.AddHostedService<BroadcastService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
}

app.UseCors("AllowSpecific");
app.UseStaticFiles();

app.UseRouting();

app.MapBlazorHub();
app.MapFallbackToPage("/_Host");

// 3. Map the Hub endpoint
app.MapHub<MyHub>("/myHub");

// (Optional) If you want to serve a static HTML page for testing:
app.UseDefaultFiles(); // to serve index.html if present
app.UseStaticFiles();  // for static assets

app.Run();
