import { useState, useEffect, useRef } from 'react';
import { DocumentDuplicateIcon, MagnifyingGlassIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { RatingTemplate } from '../../types/Rating';

interface TemplateSelectorProps {
  templates: RatingTemplate[];
  selectedTemplateId: number | "";
  onSelectTemplate: (templateId: number | "") => void;
}

export default function TemplateSelector({ 
  templates, 
  selectedTemplateId, 
  onSelectTemplate 
}: TemplateSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [groupedTemplates, setGroupedTemplates] = useState<Record<string, RatingTemplate[]>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grouped = templates.reduce((acc, template) => {
      if (!acc[template.type]) {
        acc[template.type] = [];
      }
      acc[template.type].push(template);
      return acc;
    }, {} as Record<string, RatingTemplate[]>);
    setGroupedTemplates(grouped);
  }, [templates]);

  const filteredTemplates = searchTerm.trim() === '' 
    ? templates 
    : templates.filter(template => 
        template.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        template.type.toLowerCase().includes(searchTerm.toLowerCase())
      );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative border bg-white rounded-lg p-3 pl-10 flex justify-between items-center cursor-pointer 
          transition-all duration-200 shadow-sm
          ${selectedTemplateId 
            ? "border-blue-300 shadow-md hover:shadow-blue-100" 
            : "border-gray-300 hover:border-blue-400"
          }
        `}
      >
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
          <DocumentDuplicateIcon className="w-5 h-5 text-blue-500" />
        </div>

        {selectedTemplateId ? (
          <div className="flex-1 truncate">
            <span className="font-medium text-gray-900">{selectedTemplate?.title}</span>
            <span className="ml-2 text-sm bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
              {selectedTemplate?.type}
            </span>
          </div>
        ) : (
          <span className="text-gray-500">Виберіть шаблон рейтингу</span>
        )}

        <div className="ml-2 flex-shrink-0">
          {selectedTemplateId ? (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSelectTemplate("");
              }}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          ) : (
            <svg 
              className={`w-5 h-5 text-blue-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-blue-100 rounded-xl shadow-xl overflow-hidden max-h-96 flex flex-col animate-fadeIn">
          <div className="sticky top-0 bg-white p-3 border-b border-gray-100 shadow-sm">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-blue-500" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 text-sm transition-shadow duration-200"
                placeholder="Пошук шаблонів..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="overflow-auto flex-1">
            {searchTerm.trim() === '' ? (
              Object.entries(groupedTemplates).map(([type, typeTemplates]) => (
                <div key={type} className="border-b border-gray-100 last:border-b-0">
                  <div className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase py-2 px-4">
                    {type}
                  </div>
                  <div>
                    {typeTemplates.map((template) => (
                      <TemplateItem 
                        key={template.id}
                        template={template}
                        isSelected={template.id === selectedTemplateId}
                        onSelect={() => {
                          onSelectTemplate(template.id);
                          setIsOpen(false);
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => (
                <TemplateItem 
                  key={template.id}
                  template={template}
                  isSelected={template.id === selectedTemplateId}
                  onSelect={() => {
                    onSelectTemplate(template.id);
                    setIsOpen(false);
                  }}
                  highlight={searchTerm}
                />
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                Немає шаблонів, які відповідають "{searchTerm}"
              </div>
            )}
          </div>
          
          <div className="sticky bottom-0 bg-white p-2 border-t border-gray-100">
            <button 
              onClick={() => {
                onSelectTemplate("");
                setIsOpen(false);
              }}
              className="w-full text-sm text-gray-600 hover:text-blue-600 py-2 flex items-center justify-center"
            >
              <XMarkIcon className="w-4 h-4 mr-1" />
              Очистити вибір
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface TemplateItemProps {
  template: RatingTemplate;
  isSelected: boolean;
  onSelect: () => void;
  highlight?: string;
}

function TemplateItem({ template, isSelected, onSelect, highlight }: TemplateItemProps) {
  const itemsCount = template.items.length;
  
  const highlightText = (text: string) => {
    if (!highlight || highlight.trim() === '') return text;
    
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? 
        <span key={i} className="bg-yellow-200">{part}</span> : 
        part
    );
  };

  return (
    <div 
      className={`px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-blue-50 cursor-pointer transition-colors flex items-center ${
        isSelected ? 'bg-blue-50' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center">
          <span className="font-medium text-gray-900">{highlightText(template.title)}</span>
          <span className="ml-2 text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">{highlightText(template.type)}</span>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {itemsCount} {itemsCount === 1 ? 'критерій' : 
                         itemsCount > 1 && itemsCount < 5 ? 'критерії' : 'критеріїв'}
        </p>
      </div>
      
      {isSelected && (
        <span className="ml-2 flex-shrink-0 text-blue-600">
          <CheckIcon className="w-5 h-5" />
        </span>
      )}
    </div>
  );
}