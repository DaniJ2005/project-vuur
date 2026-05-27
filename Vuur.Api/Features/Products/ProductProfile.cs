// Deze class is er letterlijk alleen voor de automapper

using AutoMapper;

namespace Vuur.Api.Features.Products;

public class ProductProfile : Profile
{
    public ProductProfile()
    {
        CreateMap<CreateProductRequest, Product>();
        // Dit maakt een map zodat we cleaner de values van een product kunnen updaten
        CreateMap<UpdateProductRequest, Product>()
            .ForMember(dest => dest.Id,
                opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt,
                opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt,
                opt => opt.Ignore())
            .ForAllMembers(opt =>
                opt.Condition((src, dest, srcMember) =>
                    srcMember != null));
    }
}