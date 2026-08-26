class DocumentAnalizeDomain { 
  static async analize(cartographyDistance) {
    if (typeof cartographyDistance !== "number") {
      const err = new Error("Distância cartográfica deve ser um número");
      err.code = "NOT_A_NUMBER";
      throw err;
    }

    if (cartographyDistance < 0.45) {
      return { 
        success: true,
        confidenceLevel: "alta_confianca",
        message: "Identidade validada com alta confiança"
      };
    }
    
    if (cartographyDistance < 0.6) {
      return { 
        success: true,
        confidenceLevel: "confianca_moderada", 
        message: "Identidade validada com confiança moderada"
      };
    }
    
    if (cartographyDistance < 0.7) {
      return { 
        success: false,
        confidenceLevel: "duvidoso", 
        message: "Identidade validada com dúvidas"
      }; 
    }
    
    return { 
      success: false,
      confidenceLevel: "reprovado",
      message: "Identidade não validada" };
    }

}

module.exports = DocumentAnalizeDomain;
