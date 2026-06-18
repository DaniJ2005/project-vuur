namespace Vuur.Api.Features.Products;


public interface IProductCache
{
    Task<Product?> GetByIdAsync(string id);
    Task SetByIdAsync(Product product);
    Task InvalidateAsync(string id);
    Task<ProductFacets?> GetFacetsAsync();
    Task SetFacetsAsync(ProductFacets facets);
    Task InvalidateFacetsAsync();
}
