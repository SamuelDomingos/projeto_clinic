import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface DocumentsAttachmentsSectionProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onFilesChange?: (files: FileList | null) => void;
}

const DocumentsAttachmentsSection: React.FC<DocumentsAttachmentsSectionProps> = ({
  isOpen,
  setIsOpen,
  onFilesChange,
}) => {
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-4">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-4 h-auto border rounded-lg hover:bg-muted/50"
        >
          <span className="font-medium">Documentos e anexos</span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 px-4">
        <div className="space-y-2">
          <Label htmlFor="uploadDocuments" className="text-sm font-medium">Fazer Upload de Documentos</Label>
          <Input
            id="uploadDocuments"
            type="file"
            multiple
            className="h-11 border-2 focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground"
            onChange={e => onFilesChange?.(e.target.files)}
          />
        </div>
        <p className="text-sm text-muted-foreground">Lista de documentos anexados (se houver).</p>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default DocumentsAttachmentsSection; 