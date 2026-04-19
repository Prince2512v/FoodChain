using FoodSupplyChainAPI.Data;
using FoodSupplyChainAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodSupplyChainAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _context.Products.ToListAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();
            return Ok(product);
        }

        [HttpGet("batch/{batchId}")]
        public async Task<IActionResult> GetByBatchId(string batchId)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.BatchId == batchId);
            if (product == null) return NotFound();
            return Ok(product);
        }
    }
}
