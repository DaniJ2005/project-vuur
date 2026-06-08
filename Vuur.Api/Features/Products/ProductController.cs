using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Vuur.Api.Features.Products;

[ApiController]
[Route("api/products")]
[Produces("application/json")]
public class ProductController(ProductService service) : ControllerBase
{
    // GET /api/products
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var products = await service.GetAllAsync();
        return Ok(products);
    }

    // GET /api/products/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var product = await service.GetByIdAsync(id);
        if (product is null) return NotFound();
        return Ok(product);
    }

    // POST /api/products
    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Create([FromBody] CreateProductRequest req)
    {
        var created = await service.CreateAsync(req);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // PUT /api/products/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateProductRequest req)
    {
        var updated = await service.UpdateAsync(id, req);
        if (!updated) return NotFound();
        return NoContent();
    }

    // DELETE /api/products/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(string id)
    {
        var deleted = await service.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
