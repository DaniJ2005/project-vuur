using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Vuur.Api.Features.Products;

[ApiController]
[Route("api/products")]
[Produces("application/json")]
public class ProductController(ProductService service) : ControllerBase
{
    // GET /api/products  (cursor-paginated + filtered)
    [HttpGet]
    public async Task<IActionResult> GetPage(
        [FromQuery] int limit = 20,
        [FromQuery] string? cursor = null,
        [FromQuery] string sort = "newest",
        [FromQuery] string? search = null,
        [FromQuery] string? platform = null,
        [FromQuery] string? format = null,
        [FromQuery] string? genre = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] string? flag = null)
    {
        var page = await service.GetPageAsync(
            new ProductQuery(limit, cursor, sort, search, platform, format, genre, maxPrice, flag));
        return Ok(page);
    }

    // GET /api/products/facets  (distinct genres + platforms for the filter sidebar)
    [HttpGet("facets")]
    public async Task<IActionResult> GetFacets()
        => Ok(await service.GetFacetsAsync());

    // GET /api/products/by-ids?ids=a,b,c  (batch fetch for the wishlist)
    [HttpGet("by-ids")]
    public async Task<IActionResult> GetByIds([FromQuery] string ids)
    {
        var idList = (ids ?? string.Empty)
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        return Ok(await service.GetByIdsAsync(idList));
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
