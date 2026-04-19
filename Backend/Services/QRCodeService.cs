using QRCoder;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

namespace FoodSupplyChainAPI.Services
{
    public interface IQRCodeService
    {
        string GenerateQRCode(string text);
        string GetVerificationUrl(string batchId);
    }

    public class QRCodeService : IQRCodeService
    {
        private readonly IConfiguration _configuration;

        public QRCodeService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateQRCode(string text)
        {
            using (QRCodeGenerator qrGenerator = new QRCodeGenerator())
            {
                using (QRCodeData qrCodeData = qrGenerator.CreateQrCode(text, QRCodeGenerator.ECCLevel.Q))
                {
                    using (PngByteQRCode qrCode = new PngByteQRCode(qrCodeData))
                    {
                        byte[] qrCodeAsPngByteArr = qrCode.GetGraphic(20);
                        return $"data:image/png;base64,{Convert.ToBase64String(qrCodeAsPngByteArr)}";
                    }
                }
            }
        }

        public string GetVerificationUrl(string batchId)
        {
            // Use local dev URL for now, can be replaced via configuration
            string baseUrl = _configuration["App:BaseUrl"] ?? "http://localhost:5173";
            return $"{baseUrl}/verify/{batchId}";
        }
    }
}
