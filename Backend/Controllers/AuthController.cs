using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FoodSupplyChainAPI.Data;
using FoodSupplyChainAPI.DTOs;
using FoodSupplyChainAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace FoodSupplyChainAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto model)
        {
            if (await _context.Users.AnyAsync(u => u.Email == model.Email))
                return BadRequest("User already exists.");

            var user = new User
            {
                Name = model.Name,
                Email = model.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(model.Password),
                Role = model.Role,
                Status = "Active",
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("User registered successfully.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto model)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);
            if (user == null) return Unauthorized("Invalid credentials.");

            bool isPasswordValid = false;

            try 
            {
                // 1. Try modern BCrypt verification
                isPasswordValid = BCrypt.Net.BCrypt.Verify(model.Password, user.Password);
            }
            catch (BCrypt.Net.SaltParseException) 
            {
                // 2. Legacy fallback: check if it's a plain-text password (temporary migration logic)
                if (user.Password == model.Password)
                {
                    // Upgrade legacy plain-text password to BCrypt hash
                    user.Password = BCrypt.Net.BCrypt.HashPassword(model.Password);
                    await _context.SaveChangesAsync();
                    isPasswordValid = true;
                }
            }

            if (!isPasswordValid)
                return Unauthorized("Invalid credentials.");

            if (user.Status == "Blocked")
                return Unauthorized("Your account has been blocked by the administrator.");

            var token = GenerateJwtToken(user);
            return Ok(new { token, user.Role, user.Name });
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Key"]!);

            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Name),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
