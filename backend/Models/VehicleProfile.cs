using AutoMapper;

namespace backend.Models
{
    public class VehicleProfile : Profile
    {
        public VehicleProfile()
        {
            CreateMap<Vehicle, VehicleDto>()
                .ForMember(dest => dest.DriverName, opt => opt.MapFrom(src => src.Driver != null ? src.Driver.FullName : string.Empty))
                .ForMember(dest => dest.CompanyName, opt => opt.MapFrom(src => src.CompanyName))
                .ForMember(dest => dest.Brand, opt => opt.MapFrom(src => src.Brand ?? string.Empty))
                .ForMember(dest => dest.Model, opt => opt.MapFrom(src => src.Model ?? string.Empty));
        }
    }
} 