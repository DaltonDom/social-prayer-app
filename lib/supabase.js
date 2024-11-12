import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = "https://vdkeweviyydgzbrlgsgj.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZka2V3ZXZpeXlkZ3picmxnc2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzODAxMjksImV4cCI6MjA0Njk1NjEyOX0.mONr24rxY8jcBMBkhPncNiL4bz-EiTkM5-jjDMOU3QM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
