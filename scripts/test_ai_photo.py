#!/usr/bin/env python3
"""Test script for photo analysis API with confidence score verification"""
import requests
import json

# Mock 1x1 pixel green image as base64
MOCK_BASE64_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

def test_analyze_photo():
    """Test the analyze-photo endpoint for confidence score"""
    try:
        response = requests.post(
            'http://localhost:3000/api/ai/analyze-photo',
            headers={'Content-Type': 'application/json'},
            json={'image': MOCK_BASE64_IMAGE},
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"API returned status {response.status_code}")
            print(response.text)
            return False
            
        result = response.json()
        print("Photo analysis test result:")
        print(json.dumps(result, indent=2))
        
        # Verify the structure includes confidence score
        required_fields = ['detectedIssue', 'severity', 'estimatedParts', 
                          'estimatedLaborMin', 'estimatedLaborMax', 
                          'description', 'confidence']
        
        missing = [f for f in required_fields if f not in result]
        if missing:
            print(f"\n✓ Test failed: Missing fields: {missing}")
            return False
        
        print(f"\n✅ Test passed: All required fields present")
        print(f"Confidence: {result['confidence'] * 100:.0f}%")
        return True
        
    except Exception as e:
        print(f"\n✗ Test failed with error: {e}")
        return False

def generate_daily_report():
    """Generate a sample daily consumption report"""
    print("\n" + "="*50)
    print("DAILY CONSUMPTION REPORT (SIMULATED)")
    print("="*50)
    print("DeepSeek API Usage:")
    print("  - Total Spend: $X.XX")
    print("  - Tokens Used: X,XXX input / X,XXX output")
    print("  - Models: DeepSeek V4 Flash")
    print("\nOpenRouter API Usage:")
    print("  - Total Spend: $X.XX")
    print("  - Tokens Used: X,XXX input / X,XXX output")
    print("  - Models: Qwen3 VL 8B, Qwen3.5 Flash")
    print("\nCombined Total Cost Today: $X.XX")
    print("Report ready for email delivery.")
    print("="*50)

if __name__ == '__main__':
    test_analyze_photo()
    generate_daily_report()

# Note: This script should be modified to use actual API endpoint when deployed