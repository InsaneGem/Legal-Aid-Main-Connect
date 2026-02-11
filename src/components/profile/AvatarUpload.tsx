import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Camera, Loader2, Trash2 } from 'lucide-react';
interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl: string | null;
  fallbackName: string;
  onAvatarChange: (url: string | null) => void;
  size?: 'sm' | 'md' | 'lg';
}
const sizeClasses = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
};
export const AvatarUpload = ({ userId, currentAvatarUrl, fallbackName, onAvatarChange, size = 'md' }: AvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', title: 'Invalid file', description: 'Please select an image file.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'File too large', description: 'Maximum file size is 5MB.' });
      return;
    }
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/avatar.${fileExt}`;
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      // Add cache buster
      const avatarUrl = `${publicUrl}?t=${Date.now()}`;
      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
        .eq('id', userId);
      if (updateError) throw updateError;
      onAvatarChange(avatarUrl);
      toast({ title: '✅ Avatar updated!' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Upload failed', description: error.message });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  const handleRemove = async () => {
    setUploading(true);
    try {
      // List and remove files in user's avatar folder
      const { data: files } = await supabase.storage.from('avatars').list(userId);
      if (files && files.length > 0) {
        await supabase.storage.from('avatars').remove(files.map(f => `${userId}/${f.name}`));
      }
      // Clear avatar_url in profile
      await supabase.from('profiles')
        .update({ avatar_url: null, updated_at: new Date().toISOString() })
        .eq('id', userId);
      onAvatarChange(null);
      toast({ title: 'Avatar removed' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Failed to remove', description: error.message });
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className={`${sizeClasses[size]} border-4 border-background shadow-lg`}>
          <AvatarImage src={currentAvatarUrl || ''} />
          <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
            {fallbackName?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
      <div className="space-y-1">
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Change Photo'}
        </Button>
        {currentAvatarUrl && (
          <Button variant="ghost" size="sm" onClick={handleRemove} disabled={uploading} className="text-destructive hover:text-destructive">
            <Trash2 className="h-3 w-3 mr-1" />
            Remove
          </Button>
        )}
        <p className="text-xs text-muted-foreground">JPG, PNG, GIF. Max 5MB.</p>
      </div>
    </div>
  );
};