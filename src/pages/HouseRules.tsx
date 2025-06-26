
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePoker } from "@/contexts/PokerContext";
import { Download, FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import { useToast } from "@/components/ui/use-toast";

export default function HouseRules() {
  const { activeSeason } = usePoker();
  const { toast } = useToast();

  const exportToPDF = () => {
    if (!activeSeason?.houseRules) {
      toast({
        title: "Erro",
        description: "Não há regras configuradas para exportar.",
        variant: "destructive",
      });
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Regras da Casa", 20, 30);
      
      // Nome da temporada
      if (activeSeason.name) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        doc.text(`Temporada: ${activeSeason.name}`, 20, 45);
      }
      
      // Conteúdo das regras
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      
      // Split text into lines to fit page width
      const splitText = doc.splitTextToSize(activeSeason.houseRules, 170);
      doc.text(splitText, 20, 60);
      
      // Save the PDF
      const fileName = `regras-da-casa-${activeSeason.name.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "PDF exportado",
        description: "As regras da casa foram exportadas com sucesso!",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Erro",
        description: "Não foi possível exportar o PDF.",
        variant: "destructive",
      });
    }
  };

  if (!activeSeason) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Regras da Casa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Não há temporada ativa no momento. As regras da casa são configuradas junto com a temporada.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!activeSeason.houseRules || activeSeason.houseRules.trim() === '') {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Regras da Casa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              As regras da casa ainda não foram configuradas para esta temporada. 
              Entre em "Configuração" para adicionar as regras.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Regras da Casa</h2>
        <Button onClick={exportToPDF} className="bg-poker-gold hover:bg-poker-gold/80 text-black font-bold">
          <Download className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {activeSeason.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-invert max-w-none">
            <div 
              className="text-justify leading-relaxed text-base space-y-4 font-sans"
              style={{ 
                textAlign: 'justify',
                lineHeight: '1.8',
                fontSize: '16px',
                color: '#e2e8f0'
              }}
            >
              {activeSeason.houseRules.split('\n').map((paragraph, index) => (
                paragraph.trim() !== '' && (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                )
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
